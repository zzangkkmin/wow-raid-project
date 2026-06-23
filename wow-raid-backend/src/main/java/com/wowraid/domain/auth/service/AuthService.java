package com.wowraid.domain.auth.service;

import com.wowraid.domain.auth.dto.request.FindUsernameRequest;
import com.wowraid.domain.auth.dto.request.LoginRequest;
import com.wowraid.domain.auth.dto.request.RegisterRequest;
import com.wowraid.domain.auth.dto.response.FindUsernameResponse;
import com.wowraid.domain.auth.dto.response.TokenResponse;
import com.wowraid.domain.user.entity.User;
import com.wowraid.domain.user.enums.UserRole;
import com.wowraid.domain.user.repository.UserRepository;
import com.wowraid.global.config.JwtProvider;
import com.wowraid.global.exception.BusinessException;
import com.wowraid.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final AuthenticationManager authenticationManager;

    @Value("${raid-leader.code}")
    private String raidLeaderCode;

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BusinessException(ErrorCode.DUPLICATE_USERNAME);
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        UserRole role = UserRole.MEMBER;
        if (request.raidLeaderCode() != null && !request.raidLeaderCode().isBlank()) {
            if (!raidLeaderCode.equals(request.raidLeaderCode())) {
                throw new BusinessException(ErrorCode.INVALID_RAID_LEADER_CODE);
            }
            role = UserRole.RAID_LEADER;
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .battletag(request.battletag())
                .role(role)
                .build();

        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
        } catch (BadCredentialsException e) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        String token = jwtProvider.generateToken(request.username());
        return new TokenResponse(token, user.getUsername(), user.getRole());
    }

    @Transactional(readOnly = true)
    public FindUsernameResponse findUsername(FindUsernameRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.EMAIL_NOT_FOUND));
        return new FindUsernameResponse(user.getUsername());
    }
}
