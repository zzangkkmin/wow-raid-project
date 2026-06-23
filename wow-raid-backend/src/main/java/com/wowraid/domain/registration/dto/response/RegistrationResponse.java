package com.wowraid.domain.registration.dto.response;

import com.wowraid.domain.registration.entity.GuestRegistration;
import com.wowraid.domain.registration.entity.Registration;
import com.wowraid.domain.registration.enums.RaidRole;
import com.wowraid.domain.registration.enums.RegistrationStatus;
import com.wowraid.domain.registration.enums.WowClass;
import com.wowraid.domain.registration.enums.WowSpec;

import java.time.LocalDateTime;
import java.util.UUID;

public record RegistrationResponse(
        UUID id,
        String displayName,   // 회원: username, 비회원: guestName
        boolean isGuest,
        String characterName,
        WowClass wowClass,
        WowSpec wowSpec,
        RaidRole role,
        RegistrationStatus status,
        String absenceReason,
        LocalDateTime createdAt
) {
    public static RegistrationResponse from(Registration r) {
        return new RegistrationResponse(
                r.getId(),
                r.getUser().getUsername(),
                false,
                r.getCharacterName(),
                r.getWowClass(),
                r.getWowSpec(),
                r.getRole(),
                r.getStatus(),
                r.getAbsenceReason(),
                r.getCreatedAt()
        );
    }

    public static RegistrationResponse fromGuest(GuestRegistration g) {
        return new RegistrationResponse(
                g.getId(),
                g.getGuestName(),
                true,
                g.getCharacterName(),
                g.getWowClass(),
                g.getWowSpec(),
                g.getRole(),
                g.getStatus(),
                g.getAbsenceReason(),
                g.getCreatedAt()
        );
    }
}
