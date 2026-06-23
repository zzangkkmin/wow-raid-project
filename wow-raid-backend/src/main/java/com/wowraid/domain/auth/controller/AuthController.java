package com.wowraid.domain.auth.controller;

import com.wowraid.domain.auth.dto.request.FindUsernameRequest;
import com.wowraid.domain.auth.dto.request.LoginRequest;
import com.wowraid.domain.auth.dto.request.RegisterRequest;
import com.wowraid.domain.auth.dto.response.FindUsernameResponse;
import com.wowraid.domain.auth.dto.response.TokenResponse;
import com.wowraid.domain.auth.service.AuthService;
import com.wowraid.global.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ApiResponse.ok("회원가입이 완료되었습니다.");
    }

    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @PostMapping("/find-username")
    public ApiResponse<FindUsernameResponse> findUsername(@Valid @RequestBody FindUsernameRequest request) {
        return ApiResponse.ok(authService.findUsername(request));
    }
}
