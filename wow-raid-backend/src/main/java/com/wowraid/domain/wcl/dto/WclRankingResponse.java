package com.wowraid.domain.wcl.dto;

import java.util.List;

public record WclRankingResponse(
        String characterName,
        String server,
        Double bestPerformanceAverage,
        List<EncounterRanking> rankings
) {
    public record EncounterRanking(
            String encounterName,
            double rankPercent
    ) {}
}
