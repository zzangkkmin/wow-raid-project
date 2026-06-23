package com.wowraid.domain.registration.service;

import com.wowraid.domain.raid.entity.RaidSchedule;
import com.wowraid.domain.raid.service.RaidService;
import com.wowraid.domain.registration.dto.request.GuestAuthRequest;
import com.wowraid.domain.registration.dto.request.GuestRegistrationRequest;
import com.wowraid.domain.registration.dto.response.RegistrationResponse;
import com.wowraid.domain.registration.entity.GuestRegistration;
import com.wowraid.domain.registration.enums.RaidRole;
import com.wowraid.domain.registration.enums.RegistrationStatus;
import com.wowraid.domain.registration.repository.GuestRegistrationRepository;
import com.wowraid.domain.registration.repository.RegistrationRepository;
import com.wowraid.global.exception.BusinessException;
import com.wowraid.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GuestRegistrationService {

    private final GuestRegistrationRepository guestRegistrationRepository;
    private final RegistrationRepository registrationRepository;
    private final RaidService raidService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public RegistrationResponse register(UUID raidId, GuestRegistrationRequest request) {
        RaidSchedule raid = raidService.findRaid(raidId);
        validateRaidOpen(raid);

        if (guestRegistrationRepository.existsByRaidIdAndGuestName(raidId, request.guestName())) {
            throw new BusinessException(ErrorCode.DUPLICATE_REGISTRATION);
        }

        RegistrationStatus status = resolveStatus(raidId, request.role());
        GuestRegistration guest = GuestRegistration.builder()
                .raidSchedule(raid)
                .guestName(request.guestName())
                .guestPassword(passwordEncoder.encode(request.guestPassword()))
                .characterName(request.characterName())
                .wowClass(request.wowClass())
                .wowSpec(request.wowSpec())
                .role(request.role())
                .status(status)
                .build();

        return RegistrationResponse.fromGuest(guestRegistrationRepository.save(guest));
    }

    @Transactional
    public RegistrationResponse update(UUID raidId, UUID id, GuestAuthRequest request) {
        GuestRegistration guest = findAndAuth(id, request.guestName(), request.guestPassword());
        validateActive(guest);
        guest.update(request.characterName(), request.wowClass(), request.wowSpec(), request.role());
        return RegistrationResponse.fromGuest(guest);
    }

    @Transactional
    public void cancel(UUID raidId, UUID id, GuestAuthRequest request) {
        GuestRegistration guest = findAndAuth(id, request.guestName(), request.guestPassword());
        validateActive(guest);
        boolean wasConfirmed = guest.getStatus() == RegistrationStatus.CONFIRMED;
        RaidRole role = guest.getRole();
        guest.softDelete();
        if (wasConfirmed) promoteWaiting(raidId, role);
    }

    @Transactional
    public void reportAbsence(UUID raidId, UUID id, GuestAuthRequest request) {
        GuestRegistration guest = findAndAuth(id, request.guestName(), request.guestPassword());
        if (guest.getStatus() == RegistrationStatus.ABSENT) {
            throw new BusinessException(ErrorCode.ALREADY_ABSENT);
        }
        boolean wasConfirmed = guest.getStatus() == RegistrationStatus.CONFIRMED;
        RaidRole role = guest.getRole();
        guest.absent(request.reason());
        guest.softDelete();
        if (wasConfirmed) promoteWaiting(raidId, role);
    }

    // ── private helpers ──────────────────────────────────────────────────────

    private GuestRegistration findAndAuth(UUID id, String guestName, String guestPassword) {
        GuestRegistration guest = guestRegistrationRepository.findActiveById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.REGISTRATION_NOT_FOUND));
        if (!guest.getGuestName().equals(guestName) ||
                !passwordEncoder.matches(guestPassword, guest.getGuestPassword())) {
            throw new BusinessException(ErrorCode.GUEST_AUTH_FAILED);
        }
        return guest;
    }

    private RegistrationStatus resolveStatus(UUID raidId, RaidRole role) {
        long confirmed = registrationRepository.countConfirmedByRaidIdAndRole(raidId, role)
                + guestRegistrationRepository.countConfirmedByRaidIdAndRole(raidId, role);
        long maxSlots = getMaxSlots(raidService.findRaid(raidId), role);
        return confirmed < maxSlots ? RegistrationStatus.CONFIRMED : RegistrationStatus.WAITING;
    }

    private long getMaxSlots(RaidSchedule raid, RaidRole role) {
        return switch (role) {
            case TANK -> raid.getMaxTanks();
            case HEALER -> raid.getMaxHealers();
            case DPS -> raid.getMaxDps();
        };
    }

    private void promoteWaiting(UUID raidId, RaidRole role) {
        guestRegistrationRepository.findWaitingByRaidIdAndRole(raidId, role)
                .stream().findFirst().ifPresent(GuestRegistration::confirm);
        // 회원 대기자도 같이 승격 (created_at 기준 통합 처리 필요 시 확장)
        registrationRepository.findWaitingByRaidIdAndRole(raidId, role)
                .stream().findFirst().ifPresent(r -> {
                    // 이미 게스트가 승격됐으면 다시 확인
                    long confirmed = registrationRepository.countConfirmedByRaidIdAndRole(raidId, role)
                            + guestRegistrationRepository.countConfirmedByRaidIdAndRole(raidId, role);
                    long maxSlots = getMaxSlots(raidService.findRaid(raidId), role);
                    if (confirmed < maxSlots) r.confirm();
                });
    }

    private void validateRaidOpen(RaidSchedule raid) {
        if (!raid.isOpen()) throw new BusinessException(ErrorCode.RAID_ALREADY_CLOSED);
    }

    private void validateActive(GuestRegistration guest) {
        if (guest.getStatus() == RegistrationStatus.ABSENT) {
            throw new BusinessException(ErrorCode.ALREADY_ABSENT);
        }
    }
}
