package com.wowraid.domain.raid.dto.response;

import com.wowraid.domain.registration.enums.WowClass;

import java.util.List;
import java.util.Map;

public record RaidStatsResponse(
        RoleStats tanks,
        RoleStats healers,
        RoleStats dps
) {
    public record RoleStats(
            int confirmed,
            int waiting,
            int maxSlots,
            Map<WowClass, Long> classCounts,
            List<WowClass> missingClasses
    ) {}
}
