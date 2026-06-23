package com.wowraid.domain.registration.service;

import com.wowraid.domain.raid.entity.RaidSchedule;
import com.wowraid.domain.raid.service.RaidService;
import com.wowraid.domain.registration.dto.request.AbsenceRequest;
import com.wowraid.domain.registration.dto.request.RegistrationRequest;
import com.wowraid.domain.registration.dto.response.RegistrationResponse;
import com.wowraid.domain.registration.entity.Registration;
import com.wowraid.domain.registration.enums.RaidRole;
import com.wowraid.domain.registration.enums.RegistrationStatus;
import com.wowraid.domain.registration.repository.GuestRegistrationRepository;
import com.wowraid.domain.registration.repository.RegistrationRepository;
import com.wowraid.domain.user.entity.User;
import com.wowraid.domain.user.service.UserService;
import com.wowraid.global.exception.BusinessException;
import com.wowraid.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final GuestRegistrationRepository guestRegistrationRepository;
    private final RaidService raidService;
    private final UserService userService;

    @Transactional
    public RegistrationResponse register(String username, UUID raidId, RegistrationRequest request) {
        User user = userService.findUser(username);
        RaidSchedule raid = raidService.findRaid(raidId);

        validateRaidOpen(raid);
        if (raid.getCreatedBy().getUsername().equals(username)) {
            throw new BusinessException(ErrorCode.SELF_REGISTRATION_DENIED);
        }
        if (registrationRepository.existsByRaidIdAndUserId(raidId, user.getId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_REGISTRATION);
        }

        RegistrationStatus status = resolveStatus(raidId, request.role());
        Registration registration = Registration.builder()
                .raidSchedule(raid)
                .user(user)
                .characterName(request.characterName())
                .wowClass(request.wowClass())
                .wowSpec(request.wowSpec())
                .role(request.role())
                .status(status)
                .build();

        return RegistrationResponse.from(registrationRepository.save(registration));
    }

    @Transactional
    public RegistrationResponse update(String username, UUID raidId, RegistrationRequest request) {
        User user = userService.findUser(username);
        Registration registration = findMyRegistration(raidId, user.getId());
        validateActive(registration);
        registration.update(request.characterName(), request.wowClass(), request.wowSpec(), request.role());
        return RegistrationResponse.from(registration);
    }

    @Transactional
    public void cancel(String username, UUID raidId) {
        User user = userService.findUser(username);
        Registration registration = findMyRegistration(raidId, user.getId());
        validateActive(registration);
        boolean wasConfirmed = registration.getStatus() == RegistrationStatus.CONFIRMED;
        RaidRole role = registration.getRole();
        registration.softDelete();
        if (wasConfirmed) promoteWaiting(raidId, role);
    }

    @Transactional
    public void reportAbsence(String username, UUID raidId, AbsenceRequest request) {
        User user = userService.findUser(username);
        Registration registration = findMyRegistration(raidId, user.getId());
        if (registration.getStatus() == RegistrationStatus.ABSENT) {
            throw new BusinessException(ErrorCode.ALREADY_ABSENT);
        }
        boolean wasConfirmed = registration.getStatus() == RegistrationStatus.CONFIRMED;
        RaidRole role = registration.getRole();
        registration.absent(request.reason());
        registration.softDelete();
        if (wasConfirmed) promoteWaiting(raidId, role);
    }

    // ── private helpers ──────────────────────────────────────────────────────

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
        registrationRepository.findWaitingByRaidIdAndRole(raidId, role)
                .stream().findFirst().ifPresent(Registration::confirm);
    }

    private Registration findMyRegistration(UUID raidId, UUID userId) {
        return registrationRepository.findByRaidIdAndUserId(raidId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.REGISTRATION_NOT_FOUND));
    }

    private void validateRaidOpen(RaidSchedule raid) {
        if (!raid.isOpen()) throw new BusinessException(ErrorCode.RAID_ALREADY_CLOSED);
    }

    private void validateActive(Registration registration) {
        if (registration.getStatus() == RegistrationStatus.ABSENT) {
            throw new BusinessException(ErrorCode.ALREADY_ABSENT);
        }
    }
}
