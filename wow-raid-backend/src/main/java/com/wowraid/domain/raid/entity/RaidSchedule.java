package com.wowraid.domain.raid.entity;

import com.wowraid.domain.raid.enums.Difficulty;
import com.wowraid.domain.raid.enums.RaidStatus;
import com.wowraid.domain.user.entity.User;
import com.wowraid.global.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "raid_schedules")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class RaidSchedule extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "raid_date", nullable = false)
    private LocalDateTime raidDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Difficulty difficulty;

    @Column(name = "max_tanks", nullable = false)
    private int maxTanks;

    @Column(name = "max_healers", nullable = false)
    private int maxHealers;

    @Column(name = "max_dps", nullable = false)
    private int maxDps;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private RaidStatus status = RaidStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    public void update(String title, LocalDateTime raidDate, Difficulty difficulty,
                       int maxTanks, int maxHealers, int maxDps, String notes) {
        this.title = title;
        this.raidDate = raidDate;
        this.difficulty = difficulty;
        this.maxTanks = maxTanks;
        this.maxHealers = maxHealers;
        this.maxDps = maxDps;
        this.notes = notes;
    }

    public void close() {
        this.status = RaidStatus.CLOSED;
    }

    public boolean isOpen() {
        return this.status == RaidStatus.OPEN;
    }
}
