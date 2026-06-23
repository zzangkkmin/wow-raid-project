package com.wowraid.domain.post.dto.response;

import com.wowraid.domain.post.entity.Post;
import com.wowraid.domain.post.enums.BoardType;

import java.time.LocalDateTime;
import java.util.UUID;

public record PostDetailResponse(
        UUID id,
        BoardType boardType,
        String title,
        String content,
        String author,
        int viewCount,
        boolean pinned,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static PostDetailResponse from(Post post) {
        return new PostDetailResponse(
                post.getId(), post.getBoardType(), post.getTitle(), post.getContent(),
                post.getAuthor().getUsername(), post.getViewCount(), post.isPinned(),
                post.getCreatedAt(), post.getUpdatedAt()
        );
    }
}
