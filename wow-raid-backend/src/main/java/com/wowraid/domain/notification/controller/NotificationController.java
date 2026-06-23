package com.wowraid.domain.notification.controller;

import com.wowraid.domain.notification.dto.response.NotificationResponse;
import com.wowraid.domain.notification.dto.response.UnreadCountResponse;
import com.wowraid.domain.notification.service.NotificationService;
import com.wowraid.domain.notification.service.SseService;
import com.wowraid.global.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final SseService sseService;

    @GetMapping(value = "/subscribe", produces = "text/event-stream")
    public SseEmitter subscribe(@AuthenticationPrincipal UserDetails user) {
        return sseService.subscribe(user.getUsername());
    }

    @GetMapping
    public ApiResponse<List<NotificationResponse>> getNotifications(@AuthenticationPrincipal UserDetails user) {
        return ApiResponse.ok(notificationService.getNotifications(user.getUsername()));
    }

    @GetMapping("/unread-count")
    public ApiResponse<UnreadCountResponse> getUnreadCount(@AuthenticationPrincipal UserDetails user) {
        return ApiResponse.ok(notificationService.getUnreadCount(user.getUsername()));
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@AuthenticationPrincipal UserDetails user,
                                         @PathVariable UUID id) {
        notificationService.markAsRead(user.getUsername(), id);
        return ApiResponse.ok("읽음 처리되었습니다.");
    }

    @PatchMapping("/read-all")
    public ApiResponse<Void> markAllAsRead(@AuthenticationPrincipal UserDetails user) {
        notificationService.markAllAsRead(user.getUsername());
        return ApiResponse.ok("전체 읽음 처리되었습니다.");
    }
}
