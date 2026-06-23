package com.wowraid.domain.registration.dto.request;

import com.wowraid.domain.registration.enums.RaidRole;
import com.wowraid.domain.registration.enums.WowClass;
import com.wowraid.domain.registration.enums.WowSpec;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GuestRegistrationRequest(
        @NotBlank @Size(max = 50) String guestName,
        @NotBlank @Size(min = 4) String guestPassword,
        @NotBlank String characterName,
        @NotNull WowClass wowClass,
        @NotNull WowSpec wowSpec,
        @NotNull RaidRole role
) {}
