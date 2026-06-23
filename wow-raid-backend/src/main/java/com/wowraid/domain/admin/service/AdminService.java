package com.wowraid.domain.admin.service;

import com.wowraid.domain.post.repository.PostRepository;
import com.wowraid.domain.raid.repository.RaidRepository;
import com.wowraid.domain.user.entity.User;
import com.wowraid.domain.user.enums.UserRole;
import com.wowraid.domain.user.repository.UserRepository;
import com.wowraid.global.exception.BusinessException;
import com.wowraid.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RaidRepository raidRepository;
    private final PostRepository postRepository;

    @Transactional(readOnly = true)
    public Page<User> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Transactional
    public void changeRole(UUID userId, UserRole newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (user.getRole() == UserRole.ADMIN || newRole == UserRole.ADMIN) {
            throw new BusinessException(ErrorCode.CANNOT_CHANGE_ADMIN_ROLE);
        }
        user.changeRole(newRole);
    }

    @Transactional
    public void forceWithdraw(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        user.softDelete();
    }

    @Transactional
    public void forceDeleteRaid(UUID raidId) {
        raidRepository.findById(raidId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RAID_NOT_FOUND))
                .softDelete();
    }

    @Transactional
    public void forceDeletePost(UUID postId) {
        postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND))
                .softDelete();
    }
}
