package com.wowraid.domain.registration.dto.request;

import com.wowraid.domain.registration.enums.RaidRole;
import com.wowraid.domain.registration.enums.WowClass;
import com.wowraid.domain.registration.enums.WowSpec;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GuestAuthRequest(
        @NotBlank String guestName,
        @NotBlank String guestPassword,
        String characterName,
        WowClass wowClass,
        WowSpec wowSpec,
        RaidRole role,
        String reason
) {}
