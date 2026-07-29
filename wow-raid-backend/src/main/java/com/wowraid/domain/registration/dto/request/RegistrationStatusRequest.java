package com.wowraid.domain.registration.dto.request;

import com.wowraid.domain.registration.enums.RegistrationStatus;
import jakarta.validation.constraints.NotNull;

public record RegistrationStatusRequest(
        @NotNull RegistrationStatus status
) {}
