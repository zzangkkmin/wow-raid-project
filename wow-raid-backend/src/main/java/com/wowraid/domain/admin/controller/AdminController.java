package com.wowraid.domain.admin.controller;

import com.wowraid.domain.admin.service.AdminService;
import com.wowraid.domain.user.enums.UserRole;
import com.wowraid.global.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ApiResponse<?> getUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.ok(adminService.getUsers(pageable));
    }

    @PatchMapping("/users/{id}/role")
    public ApiResponse<Void> changeRole(@PathVariable UUID id,
                                         @RequestParam UserRole role) {
        adminService.changeRole(id, role);
        return ApiResponse.ok("역할이 변경되었습니다.");
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<Void> forceWithdraw(@PathVariable UUID id) {
        adminService.forceWithdraw(id);
        return ApiResponse.ok("회원이 강제 탈퇴되었습니다.");
    }

    @DeleteMapping("/raids/{id}")
    public ApiResponse<Void> forceDeleteRaid(@PathVariable UUID id) {
        adminService.forceDeleteRaid(id);
        return ApiResponse.ok("레이드가 삭제되었습니다.");
    }

    @DeleteMapping("/posts/{id}")
    public ApiResponse<Void> forceDeletePost(@PathVariable UUID id) {
        adminService.forceDeletePost(id);
        return ApiResponse.ok("게시글이 삭제되었습니다.");
    }
}
