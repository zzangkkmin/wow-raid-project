package com.wowraid.domain.registration.repository;

import com.wowraid.domain.registration.entity.Registration;
import com.wowraid.domain.registration.enums.RaidRole;
import com.wowraid.domain.registration.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RegistrationRepository extends JpaRepository<Registration, UUID> {

    @Query("SELECT r FROM Registration r WHERE r.raidSchedule.id = :raidId AND r.deletedAt IS NULL")
    List<Registration> findAllByRaidId(@Param("raidId") UUID raidId);

    @Query("SELECT r FROM Registration r WHERE r.raidSchedule.id = :raidId AND r.user.id = :userId AND r.deletedAt IS NULL")
    Optional<Registration> findByRaidIdAndUserId(@Param("raidId") UUID raidId, @Param("userId") UUID userId);

    @Query("SELECT COUNT(r) > 0 FROM Registration r WHERE r.raidSchedule.id = :raidId AND r.user.id = :userId AND r.deletedAt IS NULL")
    boolean existsByRaidIdAndUserId(@Param("raidId") UUID raidId, @Param("userId") UUID userId);

    // 역할별 CONFIRMED 인원 수
    @Query("SELECT COUNT(r) FROM Registration r WHERE r.raidSchedule.id = :raidId AND r.role = :role AND r.status = 'CONFIRMED' AND r.deletedAt IS NULL")
    long countConfirmedByRaidIdAndRole(@Param("raidId") UUID raidId, @Param("role") RaidRole role);

    // 대기자 중 가장 빠른 신청자 (자동 승격용)
    @Query("SELECT r FROM Registration r WHERE r.raidSchedule.id = :raidId AND r.role = :role AND r.status = 'WAITING' AND r.deletedAt IS NULL ORDER BY r.createdAt ASC")
    List<Registration> findWaitingByRaidIdAndRole(@Param("raidId") UUID raidId, @Param("role") RaidRole role);

    // 역할별 직업 통계
    @Query("SELECT r.wowClass, COUNT(r) FROM Registration r WHERE r.raidSchedule.id = :raidId AND r.role = :role AND r.status IN :statuses AND r.deletedAt IS NULL GROUP BY r.wowClass")
    List<Object[]> countByWowClassAndRole(@Param("raidId") UUID raidId, @Param("role") RaidRole role, @Param("statuses") List<RegistrationStatus> statuses);
}
