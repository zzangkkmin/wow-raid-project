package com.wowraid.domain.user.entity;

import com.wowraid.domain.registration.enums.WowClass;
import com.wowraid.domain.registration.enums.WowSpec;
import com.wowraid.global.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "user_characters")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class UserCharacter extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

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

    @Column(name = "is_main", nullable = false)
    private boolean isMain;

    public void setMain(boolean isMain) {
        this.isMain = isMain;
    }
}
