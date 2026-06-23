package com.wowraid.domain.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record FindUsernameRequest(
        @NotBlank @Email String email
) {}
