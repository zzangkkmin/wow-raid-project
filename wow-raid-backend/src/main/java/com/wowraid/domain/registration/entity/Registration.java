package com.wowraid.domain.registration.entity;

import com.wowraid.domain.raid.entity.RaidSchedule;
import com.wowraid.domain.registration.enums.RaidRole;
import com.wowraid.domain.registration.enums.RegistrationStatus;
import com.wowraid.domain.registration.enums.WowClass;
import com.wowraid.domain.registration.enums.WowSpec;
import com.wowraid.domain.user.entity.User;
import com.wowraid.global.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "raid_registrations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Registration extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raid_schedule_id", nullable = false)
    private RaidSchedule raidSchedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "character_name", nullable = false, length = 50)
    private String characterName;

    @Enumerated(EnumType.STRING)
    @Column(name = "wow_class", nullable = false, length = 20)
    private WowClass wowClass;

    @Enumerated(EnumType.STRING)
    @Column(name = "wow_spec", nullable = false, length = 30)
    private WowSpec wowSpec;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private RaidRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private RegistrationStatus status;

    @Column(name = "absence_reason", columnDefinition = "TEXT")
    private String absenceReason;

    public void update(String characterName, WowClass wowClass, WowSpec wowSpec, RaidRole role) {
        this.characterName = characterName;
        this.wowClass = wowClass;
        this.wowSpec = wowSpec;
        this.role = role;
    }

    public void confirm() {
        this.status = RegistrationStatus.CONFIRMED;
    }

    public void waiting() {
        this.status = RegistrationStatus.WAITING;
    }

    public void absent(String reason) {
        this.status = RegistrationStatus.ABSENT;
        this.absenceReason = reason;
    }
}
