package com.wowraid.domain.registration.dto.request;

import com.wowraid.domain.registration.enums.RaidRole;
import com.wowraid.domain.registration.enums.WowClass;
import com.wowraid.domain.registration.enums.WowSpec;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegistrationRequest(
        @NotBlank String characterName,
        @NotNull WowClass wowClass,
        @NotNull WowSpec wowSpec,
        @NotNull RaidRole role
) {}
