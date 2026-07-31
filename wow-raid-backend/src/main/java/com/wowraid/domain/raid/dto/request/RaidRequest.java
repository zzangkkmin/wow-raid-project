package com.wowraid.domain.raid.dto.request;

import com.wowraid.domain.raid.enums.Difficulty;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public record RaidRequest(
        @NotBlank String title,
        @NotNull @Future LocalDateTime raidDate,
        @NotNull Difficulty difficulty,
        @Positive int maxTanks,
        @Positive int maxHealers,
        @Positive int maxDps,
        String notes,
        @Pattern(
                regexp = "^$|https://(discord\\.gg|discord\\.com)/.+",
                message = "디스코드 링크는 discord.gg 또는 discord.com 주소여야 합니다."
        )
        String discordUrl
) {}
