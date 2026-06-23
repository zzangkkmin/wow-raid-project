package com.wowraid.domain.post.controller;

import com.wowraid.domain.post.dto.request.PostRequest;
import com.wowraid.domain.post.dto.response.PostDetailResponse;
import com.wowraid.domain.post.dto.response.PostListResponse;
import com.wowraid.domain.post.enums.BoardType;
import com.wowraid.domain.post.service.PostService;
import com.wowraid.global.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ApiResponse<Page<PostListResponse>> getList(
            @RequestParam BoardType boardType,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.ok(postService.getList(boardType, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<PostDetailResponse> getDetail(@PathVariable UUID id) {
        return ApiResponse.ok(postService.getDetail(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PostDetailResponse> create(@AuthenticationPrincipal UserDetails user,
                                                   @Valid @RequestBody PostRequest request) {
        return ApiResponse.ok(postService.create(user.getUsername(), request));
    }

    @PutMapping("/{id}")
    public ApiResponse<PostDetailResponse> update(@AuthenticationPrincipal UserDetails user,
                                                   @PathVariable UUID id,
                                                   @Valid @RequestBody PostRequest request) {
        return ApiResponse.ok(postService.update(user.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal UserDetails user,
                                     @PathVariable UUID id) {
        postService.delete(user.getUsername(), id);
        return ApiResponse.ok("게시글이 삭제되었습니다.");
    }
}
