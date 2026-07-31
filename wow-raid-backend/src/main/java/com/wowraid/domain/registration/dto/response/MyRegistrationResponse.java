package com.wowraid.domain.registration.dto.response;

import com.wowraid.domain.raid.enums.Difficulty;
import com.wowraid.domain.raid.enums.RaidStatus;
import com.wowraid.domain.registration.entity.Registration;
import com.wowraid.domain.registration.enums.RaidRole;
import com.wowraid.domain.registration.enums.RegistrationStatus;
import com.wowraid.domain.registration.enums.WowClass;
import com.wowraid.domain.registration.enums.WowSpec;

import java.time.LocalDateTime;
import java.util.UUID;

public record MyRegistrationResponse(
        UUID registrationId,
        RegistrationStatus status,
        RaidRole role,
        String server,
        String characterName,
        WowClass wowClass,
        WowSpec wowSpec,
        String absenceReason,
        LocalDateTime createdAt,
        // 레이드 정보
        UUID raidId,
        String raidTitle,
        LocalDateTime raidDate,
        Difficulty difficulty,
        RaidStatus raidStatus
) {
    public static MyRegistrationResponse from(Registration r) {
        var raid = r.getRaidSchedule();
        return new MyRegistrationResponse(
                r.getId(),
                r.getStatus(),
                r.getRole(),
                r.getServer(),
                r.getCharacterName(),
                r.getWowClass(),
                r.getWowSpec(),
                r.getAbsenceReason(),
                r.getCreatedAt(),
                raid.getId(),
                raid.getTitle(),
                raid.getRaidDate(),
                raid.getDifficulty(),
                raid.getStatus()
        );
    }
}
