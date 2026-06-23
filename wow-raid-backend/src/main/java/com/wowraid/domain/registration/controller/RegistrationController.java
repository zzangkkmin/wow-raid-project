package com.wowraid.domain.registration.controller;

import com.wowraid.domain.registration.dto.request.AbsenceRequest;
import com.wowraid.domain.registration.dto.request.RegistrationRequest;
import com.wowraid.domain.registration.dto.response.RegistrationResponse;
import com.wowraid.domain.registration.service.RegistrationService;
import com.wowraid.global.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/raids/{raidId}/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RegistrationResponse> register(@AuthenticationPrincipal UserDetails user,
                                                       @PathVariable UUID raidId,
                                                       @Valid @RequestBody RegistrationRequest request) {
        return ApiResponse.ok(registrationService.register(user.getUsername(), raidId, request));
    }

    @PutMapping("/me")
    public ApiResponse<RegistrationResponse> update(@AuthenticationPrincipal UserDetails user,
                                                     @PathVariable UUID raidId,
                                                     @Valid @RequestBody RegistrationRequest request) {
        return ApiResponse.ok(registrationService.update(user.getUsername(), raidId, request));
    }

    @DeleteMapping("/me")
    public ApiResponse<Void> cancel(@AuthenticationPrincipal UserDetails user,
                                     @PathVariable UUID raidId) {
        registrationService.cancel(user.getUsername(), raidId);
        return ApiResponse.ok("신청이 취소되었습니다.");
    }

    @PatchMapping("/me/absence")
    public ApiResponse<Void> reportAbsence(@AuthenticationPrincipal UserDetails user,
                                            @PathVariable UUID raidId,
                                            @Valid @RequestBody AbsenceRequest request) {
        registrationService.reportAbsence(user.getUsername(), raidId, request);
        return ApiResponse.ok("불참 신고가 완료되었습니다.");
    }
}
