package com.wowraid.domain.raid.dto.response;

import com.wowraid.domain.raid.entity.RaidSchedule;
import com.wowraid.domain.raid.enums.Difficulty;
import com.wowraid.domain.raid.enums.RaidStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record RaidListResponse(
        UUID id,
        String title,
        LocalDateTime raidDate,
        Difficulty difficulty,
        int maxTanks,
        int maxHealers,
        int maxDps,
        int confirmedTanks,
        int confirmedHealers,
        int confirmedDps,
        RaidStatus status,
        String createdBy,
        LocalDateTime createdAt
) {
    // 목록 조회용 (확정 인원 포함)
    public static RaidListResponse from(RaidSchedule raid, int confirmedTanks, int confirmedHealers, int confirmedDps) {
        return new RaidListResponse(
                raid.getId(),
                raid.getTitle(),
                raid.getRaidDate(),
                raid.getDifficulty(),
                raid.getMaxTanks(),
                raid.getMaxHealers(),
                raid.getMaxDps(),
                confirmedTanks,
                confirmedHealers,
                confirmedDps,
                raid.getStatus(),
                raid.getCreatedBy().getUsername(),
                raid.getCreatedAt()
        );
    }

    // 생성/수정 직후 반환용 (확정 인원 0)
    public static RaidListResponse from(RaidSchedule raid) {
        return from(raid, 0, 0, 0);
    }
}
