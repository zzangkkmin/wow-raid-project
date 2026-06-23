package com.wowraid.domain.user.dto.request;

import com.wowraid.domain.registration.enums.WowClass;
import com.wowraid.domain.registration.enums.WowSpec;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CharacterRequest(
        @NotBlank @Size(max = 50) String characterName,
        @NotNull WowClass wowClass,
        @NotNull WowSpec wowSpec
) {}
