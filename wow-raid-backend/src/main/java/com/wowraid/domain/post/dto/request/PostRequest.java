package com.wowraid.domain.post.dto.request;

import com.wowraid.domain.post.enums.BoardType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PostRequest(
        @NotNull BoardType boardType,
        @NotBlank String title,
        @NotBlank String content
) {}
