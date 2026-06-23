package com.wowraid.domain.raid.repository;

import com.wowraid.domain.raid.entity.RaidSchedule;
import com.wowraid.domain.raid.enums.RaidStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RaidRepository extends JpaRepository<RaidSchedule, UUID> {

    @Query("SELECT r FROM RaidSchedule r WHERE r.deletedAt IS NULL ORDER BY r.raidDate DESC")
    Page<RaidSchedule> findAllActive(Pageable pageable);

    @Query("SELECT r FROM RaidSchedule r WHERE r.status = :status AND r.deletedAt IS NULL ORDER BY r.raidDate DESC")
    Page<RaidSchedule> findAllByStatus(@Param("status") RaidStatus status, Pageable pageable);

    @Query("SELECT r FROM RaidSchedule r WHERE r.id = :id AND r.deletedAt IS NULL")
    Optional<RaidSchedule> findActiveById(@Param("id") UUID id);

    // 레이드 시간이 지났고 아직 OPEN 상태인 레이드 조회 (자동 마감용)
    @Query("SELECT r FROM RaidSchedule r WHERE r.status = 'OPEN' AND r.raidDate < :now AND r.deletedAt IS NULL")
    List<RaidSchedule> findExpiredOpenRaids(@Param("now") LocalDateTime now);
}
