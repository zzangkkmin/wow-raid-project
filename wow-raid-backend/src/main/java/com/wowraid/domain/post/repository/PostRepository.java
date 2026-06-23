package com.wowraid.domain.post.repository;

import com.wowraid.domain.post.entity.Post;
import com.wowraid.domain.post.enums.BoardType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {

    @Query("SELECT p FROM Post p WHERE p.boardType = :boardType AND p.deletedAt IS NULL ORDER BY p.pinned DESC, p.createdAt DESC")
    Page<Post> findAllByBoardType(@Param("boardType") BoardType boardType, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.id = :id AND p.deletedAt IS NULL")
    Optional<Post> findActiveById(@Param("id") UUID id);

    // 어드민용 전체 조회
    @Query("SELECT p FROM Post p WHERE p.deletedAt IS NULL ORDER BY p.createdAt DESC")
    Page<Post> findAllActive(Pageable pageable);
}
