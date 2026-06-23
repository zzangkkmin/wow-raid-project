package com.wowraid.domain.auth.dto.response;

import com.wowraid.domain.user.enums.UserRole;

public record TokenResponse(
        String accessToken,
        String username,
        UserRole role
) {}
