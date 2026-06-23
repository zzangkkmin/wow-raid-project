package com.wowraid.domain.raid.service;

import com.wowraid.domain.raid.dto.request.RaidRequest;
import com.wowraid.domain.raid.dto.response.RaidDetailResponse;
import com.wowraid.domain.raid.dto.response.RaidListResponse;
import com.wowraid.domain.raid.dto.response.RaidStatsResponse;
import com.wowraid.domain.raid.entity.RaidSchedule;
import com.wowraid.domain.raid.enums.RaidStatus;
import com.wowraid.domain.raid.repository.RaidRepository;
import com.wowraid.domain.registration.dto.response.RegistrationResponse;
import com.wowraid.domain.registration.entity.GuestRegistration;
import com.wowraid.domain.registration.entity.Registration;
import com.wowraid.domain.registration.enums.RaidRole;
import com.wowraid.domain.registration.enums.RegistrationStatus;
import com.wowraid.domain.registration.enums.WowClass;
import com.wowraid.domain.registration.repository.GuestRegistrationRepository;
import com.wowraid.domain.registration.repository.RegistrationRepository;
import com.wowraid.domain.user.entity.User;
import com.wowraid.domain.user.service.UserService;
import com.wowraid.global.exception.BusinessException;
import com.wowraid.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class RaidService {

    private final RaidRepository raidRepository;
    private final RegistrationRepository registrationRepository;
    private final GuestRegistrationRepository guestRegistrationRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public Page<RaidListResponse> getList(RaidStatus status, Pageable pageable) {
        Page<RaidSchedule> raids = (status != null)
                ? raidRepository.findAllByStatus(status, pageable)
                : raidRepository.findAllActive(pageable);
        return raids.map(raid -> {
            UUID raidId = raid.getId();
            int confirmedTanks = (int) (registrationRepository.countConfirmedByRaidIdAndRole(raidId, RaidRole.TANK)
                    + guestRegistrationRepository.countConfirmedByRaidIdAndRole(raidId, RaidRole.TANK));
            int confirmedHealers = (int) (registrationRepository.countConfirmedByRaidIdAndRole(raidId, RaidRole.HEALER)
                    + guestRegistrationRepository.countConfirmedByRaidIdAndRole(raidId, RaidRole.HEALER));
            int confirmedDps = (int) (registrationRepository.countConfirmedByRaidIdAndRole(raidId, RaidRole.DPS)
                    + guestRegistrationRepository.countConfirmedByRaidIdAndRole(raidId, RaidRole.DPS));
            return RaidListResponse.from(raid, confirmedTanks, confirmedHealers, confirmedDps);
        });
    }

    @Transactional(readOnly = true)
    public RaidDetailResponse getDetail(UUID id) {
        RaidSchedule raid = findRaid(id);
        List<RegistrationResponse> registrations = buildRegistrationList(id);
        RaidStatsResponse stats = buildStats(raid);
        return RaidDetailResponse.from(raid, registrations, stats);
    }

    @Transactional
    public RaidListResponse create(String username, RaidRequest request) {
        User user = userService.findUser(username);
        RaidSchedule raid = RaidSchedule.builder()
                .title(request.title())
                .raidDate(request.raidDate())
                .difficulty(request.difficulty())
                .maxTanks(request.maxTanks())
                .maxHealers(request.maxHealers())
                .maxDps(request.maxDps())
                .notes(request.notes())
                .createdBy(user)
                .build();
        return RaidListResponse.from(raidRepository.save(raid));
    }

    @Transactional
    public RaidListResponse update(String username, UUID id, RaidRequest request) {
        RaidSchedule raid = findRaid(id);
        validateOwner(raid, username);
        raid.update(request.title(), request.raidDate(), request.difficulty(),
                request.maxTanks(), request.maxHealers(), request.maxDps(), request.notes());
        return RaidListResponse.from(raid);
    }

    @Transactional
    public void delete(String username, UUID id) {
        RaidSchedule raid = findRaid(id);
        validateOwner(raid, username);
        raid.softDelete();
    }

    // 스케줄러용 자동 마감
    @Transactional
    public void closeExpiredRaids() {
        raidRepository.findExpiredOpenRaids(java.time.LocalDateTime.now())
                .forEach(RaidSchedule::close);
    }

    // ── private helpers ──────────────────────────────────────────────────────

    private List<RegistrationResponse> buildRegistrationList(UUID raidId) {
        List<RegistrationResponse> members = registrationRepository.findAllByRaidId(raidId)
                .stream().map(RegistrationResponse::from).toList();
        List<RegistrationResponse> guests = guestRegistrationRepository.findAllByRaidId(raidId)
                .stream().map(RegistrationResponse::fromGuest).toList();
        return Stream.concat(members.stream(), guests.stream())
                .sorted(Comparator.comparing(RegistrationResponse::createdAt))
                .toList();
    }

    private RaidStatsResponse buildStats(RaidSchedule raid) {
        UUID raidId = raid.getId();
        return new RaidStatsResponse(
                buildRoleStats(raidId, RaidRole.TANK, raid.getMaxTanks()),
                buildRoleStats(raidId, RaidRole.HEALER, raid.getMaxHealers()),
                buildRoleStats(raidId, RaidRole.DPS, raid.getMaxDps())
        );
    }

    private RaidStatsResponse.RoleStats buildRoleStats(UUID raidId, RaidRole role, int maxSlots) {
        List<RegistrationStatus> activeStatuses = List.of(RegistrationStatus.CONFIRMED, RegistrationStatus.WAITING);

        // 직업별 카운트 (회원 + 비회원 합산)
        Map<WowClass, Long> classCounts = new EnumMap<>(WowClass.class);
        mergeClassCounts(classCounts, registrationRepository.countByWowClassAndRole(raidId, role, activeStatuses));
        mergeClassCounts(classCounts, guestRegistrationRepository.countByWowClassAndRole(raidId, role, activeStatuses));

        // 미보유 직업
        List<WowClass> missingClasses = Arrays.stream(WowClass.values())
                .filter(c -> classCounts.getOrDefault(c, 0L) == 0)
                .toList();

        long confirmed = (registrationRepository.countConfirmedByRaidIdAndRole(raidId, role)
                + guestRegistrationRepository.countConfirmedByRaidIdAndRole(raidId, role));
        long waiting = classCounts.values().stream().mapToLong(Long::longValue).sum() - confirmed;

        return new RaidStatsResponse.RoleStats(
                (int) confirmed,
                (int) Math.max(0, waiting),
                maxSlots,
                classCounts,
                missingClasses
        );
    }

    private void mergeClassCounts(Map<WowClass, Long> map, List<Object[]> rows) {
        for (Object[] row : rows) {
            WowClass wowClass = (WowClass) row[0];
            Long count = (Long) row[1];
            map.merge(wowClass, count, Long::sum);
        }
    }

    public RaidSchedule findRaid(UUID id) {
        return raidRepository.findActiveById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RAID_NOT_FOUND));
    }

    private void validateOwner(RaidSchedule raid, String username) {
        if (!raid.getCreatedBy().getUsername().equals(username)) {
            throw new BusinessException(ErrorCode.RAID_ACCESS_DENIED);
        }
    }
}
