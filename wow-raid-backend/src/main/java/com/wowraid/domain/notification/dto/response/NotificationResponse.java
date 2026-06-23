package com.wowraid.domain.notification.dto.response;

import com.wowraid.domain.notification.entity.Notification;
import com.wowraid.domain.notification.enums.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String message,
        NotificationType type,
        boolean isRead,
        UUID relatedRaidId,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getMessage(), n.getType(),
                n.isRead(), n.getRelatedRaidId(), n.getCreatedAt()
        );
    }
}
