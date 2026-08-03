package com.wowraid.domain.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank
        @Size(min = 4, max = 20)
        @Pattern(regexp = "^[A-Za-z0-9]+$", message = "아이디는 영문 대소문자와 숫자만 사용할 수 있습니다.")
        String username,
        @NotBlank @Email String email,
        @NotBlank
        @Size(min = 8)
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s])\\S+$",
                message = "비밀번호는 영문 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다."
        )
        String password,
        String battletag,
        String raidLeaderCode
) {}
