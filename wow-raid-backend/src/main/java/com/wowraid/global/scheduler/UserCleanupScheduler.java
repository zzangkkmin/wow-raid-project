package com.wowraid.global.scheduler;

import com.wowraid.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserCleanupScheduler {

    private final UserRepository userRepository;

    // 매일 새벽 3시 실행
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void hardDeleteWithdrawnUsers() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(1);
        var users = userRepository.findAllToHardDelete(threshold);
        if (!users.isEmpty()) {
            userRepository.deleteAll(users);
            log.info("탈퇴 유저 하드 딜리트 완료: {}명", users.size());
        }
    }
}
