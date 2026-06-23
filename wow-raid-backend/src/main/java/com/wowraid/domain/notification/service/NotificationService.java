package com.wowraid.domain.notification.service;

import com.wowraid.domain.notification.dto.response.NotificationResponse;
import com.wowraid.domain.notification.dto.response.UnreadCountResponse;
import com.wowraid.domain.notification.entity.Notification;
import com.wowraid.domain.notification.enums.NotificationType;
import com.wowraid.domain.notification.repository.NotificationRepository;
import com.wowraid.domain.user.entity.User;
import com.wowraid.domain.user.service.UserService;
import com.wowraid.global.exception.BusinessException;
import com.wowraid.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;
    private final SseService sseService;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(String username) {
        User user = userService.findUser(username);
        return notificationRepository.findAllByUserId(user.getId())
                .stream().map(NotificationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(String username) {
        User user = userService.findUser(username);
        return new UnreadCountResponse(notificationRepository.countUnreadByUserId(user.getId()));
    }

    @Transactional
    public void markAsRead(String username, UUID notificationId) {
        Notification notification = notificationRepository.findActiveById(notificationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR));
        if (!notification.getUser().getUsername().equals(username)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        notification.markAsRead();
    }

    @Transactional
    public void markAllAsRead(String username) {
        User user = userService.findUser(username);
        notificationRepository.markAllAsReadByUserId(user.getId());
    }

    // 알림 생성 + SSE 전송
    @Transactional
    public void send(User receiver, String message, NotificationType type, UUID relatedRaidId) {
        Notification notification = Notification.builder()
                .user(receiver)
                .message(message)
                .type(type)
                .relatedRaidId(relatedRaidId)
                .build();
        notificationRepository.save(notification);
        sseService.send(receiver.getUsername(), NotificationResponse.from(notification));
    }
}
