package com.wowraid.domain.raid.dto.response;

import com.wowraid.domain.raid.entity.RaidSchedule;
import com.wowraid.domain.raid.enums.Difficulty;
import com.wowraid.domain.raid.enums.RaidStatus;
import com.wowraid.domain.registration.dto.response.RegistrationResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record RaidDetailResponse(
        UUID id,
        String title,
        LocalDateTime raidDate,
        Difficulty difficulty,
        int maxTanks,
        int maxHealers,
        int maxDps,
        String notes,
        RaidStatus status,
        String createdBy,
        LocalDateTime createdAt,
        List<RegistrationResponse> registrations,
        RaidStatsResponse stats
) {
    public static RaidDetailResponse from(RaidSchedule raid,
                                          List<RegistrationResponse> registrations,
                                          RaidStatsResponse stats) {
        return new RaidDetailResponse(
                raid.getId(),
                raid.getTitle(),
                raid.getRaidDate(),
                raid.getDifficulty(),
                raid.getMaxTanks(),
                raid.getMaxHealers(),
                raid.getMaxDps(),
                raid.getNotes(),
                raid.getStatus(),
                raid.getCreatedBy().getUsername(),
                raid.getCreatedAt(),
                registrations,
                stats
        );
    }
}
