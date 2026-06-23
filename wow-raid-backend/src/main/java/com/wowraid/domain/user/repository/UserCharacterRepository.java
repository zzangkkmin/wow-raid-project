package com.wowraid.domain.user.repository;

import com.wowraid.domain.user.entity.UserCharacter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserCharacterRepository extends JpaRepository<UserCharacter, UUID> {

    @Query("SELECT c FROM UserCharacter c WHERE c.user.id = :userId AND c.deletedAt IS NULL")
    List<UserCharacter> findAllByUserId(@Param("userId") UUID userId);

    @Query("SELECT c FROM UserCharacter c WHERE c.id = :id AND c.deletedAt IS NULL")
    Optional<UserCharacter> findActiveById(@Param("id") UUID id);

    // 대표 캐릭터 설정 전 기존 대표 해제
    @Modifying
    @Query("UPDATE UserCharacter c SET c.isMain = false WHERE c.user.id = :userId AND c.deletedAt IS NULL")
    void clearMainByUserId(@Param("userId") UUID userId);
}
