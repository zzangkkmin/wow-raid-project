package com.wowraid.domain.post.service;

import com.wowraid.domain.post.dto.request.PostRequest;
import com.wowraid.domain.post.dto.response.PostDetailResponse;
import com.wowraid.domain.post.dto.response.PostListResponse;
import com.wowraid.domain.post.entity.Post;
import com.wowraid.domain.post.enums.BoardType;
import com.wowraid.domain.post.repository.PostRepository;
import com.wowraid.domain.user.entity.User;
import com.wowraid.domain.user.enums.UserRole;
import com.wowraid.domain.user.service.UserService;
import com.wowraid.global.exception.BusinessException;
import com.wowraid.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public Page<PostListResponse> getList(BoardType boardType, Pageable pageable) {
        return postRepository.findAllByBoardType(boardType, pageable).map(PostListResponse::from);
    }

    @Transactional
    public PostDetailResponse getDetail(UUID id) {
        Post post = findPost(id);
        post.increaseViewCount();
        return PostDetailResponse.from(post);
    }

    @Transactional
    public PostDetailResponse create(String username, PostRequest request) {
        User user = userService.findUser(username);
        if (request.boardType() == BoardType.NOTICE && user.getRole() != UserRole.ADMIN) {
            throw new BusinessException(ErrorCode.NOTICE_WRITE_DENIED);
        }
        Post post = Post.builder()
                .boardType(request.boardType())
                .title(request.title())
                .content(request.content())
                .author(user)
                .build();
        return PostDetailResponse.from(postRepository.save(post));
    }

    @Transactional
    public PostDetailResponse update(String username, UUID id, PostRequest request) {
        Post post = findPost(id);
        validateAuthor(post, username);
        post.update(request.title(), request.content());
        return PostDetailResponse.from(post);
    }

    @Transactional
    public void delete(String username, UUID id) {
        Post post = findPost(id);
        validateAuthor(post, username);
        post.softDelete();
    }

    public Post findPost(UUID id) {
        return postRepository.findActiveById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
    }

    private void validateAuthor(Post post, String username) {
        if (!post.getAuthor().getUsername().equals(username)) {
            throw new BusinessException(ErrorCode.POST_ACCESS_DENIED);
        }
    }
}
