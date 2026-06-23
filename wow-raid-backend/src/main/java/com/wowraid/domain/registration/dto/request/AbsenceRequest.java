package com.wowraid.domain.registration.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AbsenceRequest(
        @NotBlank String reason
) {}
