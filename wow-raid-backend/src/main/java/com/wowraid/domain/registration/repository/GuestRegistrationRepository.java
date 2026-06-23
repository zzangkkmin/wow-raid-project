package com.wowraid.domain.registration.repository;

import com.wowraid.domain.registration.entity.GuestRegistration;
import com.wowraid.domain.registration.enums.RaidRole;
import com.wowraid.domain.registration.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GuestRegistrationRepository extends JpaRepository<GuestRegistration, UUID> {

    @Query("SELECT g FROM GuestRegistration g WHERE g.raidSchedule.id = :raidId AND g.deletedAt IS NULL")
    List<GuestRegistration> findAllByRaidId(@Param("raidId") UUID raidId);

    @Query("SELECT g FROM GuestRegistration g WHERE g.id = :id AND g.deletedAt IS NULL")
    Optional<GuestRegistration> findActiveById(@Param("id") UUID id);

    @Query("SELECT COUNT(g) > 0 FROM GuestRegistration g WHERE g.raidSchedule.id = :raidId AND g.guestName = :guestName AND g.deletedAt IS NULL")
    boolean existsByRaidIdAndGuestName(@Param("raidId") UUID raidId, @Param("guestName") String guestName);

    // 역할별 CONFIRMED 인원 수
    @Query("SELECT COUNT(g) FROM GuestRegistration g WHERE g.raidSchedule.id = :raidId AND g.role = :role AND g.status = 'CONFIRMED' AND g.deletedAt IS NULL")
    long countConfirmedByRaidIdAndRole(@Param("raidId") UUID raidId, @Param("role") RaidRole role);

    // 대기자 중 가장 빠른 신청자 (자동 승격용)
    @Query("SELECT g FROM GuestRegistration g WHERE g.raidSchedule.id = :raidId AND g.role = :role AND g.status = 'WAITING' AND g.deletedAt IS NULL ORDER BY g.createdAt ASC")
    List<GuestRegistration> findWaitingByRaidIdAndRole(@Param("raidId") UUID raidId, @Param("role") RaidRole role);

    // 역할별 직업 통계
    @Query("SELECT g.wowClass, COUNT(g) FROM GuestRegistration g WHERE g.raidSchedule.id = :raidId AND g.role = :role AND g.status IN :statuses AND g.deletedAt IS NULL GROUP BY g.wowClass")
    List<Object[]> countByWowClassAndRole(@Param("raidId") UUID raidId, @Param("role") RaidRole role, @Param("statuses") List<RegistrationStatus> statuses);
}
