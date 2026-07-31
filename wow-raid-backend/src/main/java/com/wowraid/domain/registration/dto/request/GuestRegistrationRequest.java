package com.wowraid.domain.registration.dto.request;

import com.wowraid.domain.registration.enums.RaidRole;
import com.wowraid.domain.registration.enums.WowClass;
import com.wowraid.domain.registration.enums.WowSpec;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record GuestRegistrationRequest(
        @NotBlank @Size(max = 50) String guestName,
        @NotBlank @Size(min = 4) String guestPassword,
        @NotBlank @Size(max = 30) String server,
        @NotBlank @Pattern(
                regexp = "^([가-힣]{2,8}|[a-zA-Z]{3,12})$",
                message = "캐릭터 이름은 한글 2~8자 또는 영문 3~12자여야 합니다. (특수문자·숫자 불가)"
        ) String characterName,
        @NotNull WowClass wowClass,
        @NotNull WowSpec wowSpec,
        @NotNull RaidRole role
) {}
