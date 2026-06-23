package com.wowraid.global.scheduler;

import com.wowraid.domain.raid.service.RaidService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RaidAutoCloseScheduler {

    private final RaidService raidService;

    // 매분 실행
    @Scheduled(cron = "0 * * * * *")
    public void closeExpiredRaids() {
        log.debug("레이드 자동 마감 스케줄러 실행");
        raidService.closeExpiredRaids();
    }
}
