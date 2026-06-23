package com.wowraid.domain.raid.controller;

import com.wowraid.domain.raid.dto.request.RaidRequest;
import com.wowraid.domain.raid.dto.response.RaidDetailResponse;
import com.wowraid.domain.raid.dto.response.RaidListResponse;
import com.wowraid.domain.raid.enums.RaidStatus;
import com.wowraid.domain.raid.service.RaidService;
import com.wowraid.global.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/raids")
@RequiredArgsConstructor
public class RaidController {

    private final RaidService raidService;

    @GetMapping
    public ApiResponse<Page<RaidListResponse>> getList(
            @RequestParam(required = false) RaidStatus status,
            @PageableDefault(size = 20, sort = "raidDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.ok(raidService.getList(status, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<RaidDetailResponse> getDetail(@PathVariable UUID id) {
        return ApiResponse.ok(raidService.getDetail(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RaidListResponse> create(@AuthenticationPrincipal UserDetails user,
                                                 @Valid @RequestBody RaidRequest request) {
        return ApiResponse.ok(raidService.create(user.getUsername(), request));
    }

    @PutMapping("/{id}")
    public ApiResponse<RaidListResponse> update(@AuthenticationPrincipal UserDetails user,
                                                 @PathVariable UUID id,
                                                 @Valid @RequestBody RaidRequest request) {
        return ApiResponse.ok(raidService.update(user.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal UserDetails user,
                                     @PathVariable UUID id) {
        raidService.delete(user.getUsername(), id);
        return ApiResponse.ok("레이드가 삭제되었습니다.");
    }
}
