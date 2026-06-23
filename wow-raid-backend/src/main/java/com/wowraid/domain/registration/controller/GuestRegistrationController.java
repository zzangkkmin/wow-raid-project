package com.wowraid.domain.registration.controller;

import com.wowraid.domain.registration.dto.request.GuestAuthRequest;
import com.wowraid.domain.registration.dto.request.GuestRegistrationRequest;
import com.wowraid.domain.registration.dto.response.RegistrationResponse;
import com.wowraid.domain.registration.service.GuestRegistrationService;
import com.wowraid.global.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/raids/{raidId}/guest-registrations")
@RequiredArgsConstructor
public class GuestRegistrationController {

    private final GuestRegistrationService guestRegistrationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RegistrationResponse> register(@PathVariable UUID raidId,
                                                       @Valid @RequestBody GuestRegistrationRequest request) {
        return ApiResponse.ok(guestRegistrationService.register(raidId, request));
    }

    @PutMapping("/{id}")
    public ApiResponse<RegistrationResponse> update(@PathVariable UUID raidId,
                                                     @PathVariable UUID id,
                                                     @Valid @RequestBody GuestAuthRequest request) {
        return ApiResponse.ok(guestRegistrationService.update(raidId, id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> cancel(@PathVariable UUID raidId,
                                     @PathVariable UUID id,
                                     @Valid @RequestBody GuestAuthRequest request) {
        guestRegistrationService.cancel(raidId, id, request);
        return ApiResponse.ok("신청이 취소되었습니다.");
    }

    @PatchMapping("/{id}/absence")
    public ApiResponse<Void> reportAbsence(@PathVariable UUID raidId,
                                            @PathVariable UUID id,
                                            @Valid @RequestBody GuestAuthRequest request) {
        guestRegistrationService.reportAbsence(raidId, id, request);
        return ApiResponse.ok("불참 신고가 완료되었습니다.");
    }
}
