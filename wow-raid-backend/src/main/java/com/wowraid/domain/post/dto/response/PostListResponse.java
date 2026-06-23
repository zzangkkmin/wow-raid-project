package com.wowraid.domain.post.dto.response;

import com.wowraid.domain.post.entity.Post;
import com.wowraid.domain.post.enums.BoardType;

import java.time.LocalDateTime;
import java.util.UUID;

public record PostListResponse(
        UUID id,
        BoardType boardType,
        String title,
        String author,
        int viewCount,
        boolean pinned,
        LocalDateTime createdAt
) {
    public static PostListResponse from(Post post) {
        return new PostListResponse(
                post.getId(), post.getBoardType(), post.getTitle(),
                post.getAuthor().getUsername(), post.getViewCount(),
                post.isPinned(), post.getCreatedAt()
        );
    }
}
