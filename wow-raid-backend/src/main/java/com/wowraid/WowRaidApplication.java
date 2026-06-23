package com.wowraid;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WowRaidApplication {
    public static void main(String[] args) {
        SpringApplication.run(WowRaidApplication.class, args);
    }
}
