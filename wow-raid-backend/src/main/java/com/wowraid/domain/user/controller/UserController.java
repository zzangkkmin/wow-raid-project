package com.wowraid.domain.user.controller;

import com.wowraid.domain.user.dto.request.ChangePasswordRequest;
import com.wowraid.domain.user.dto.request.CharacterRequest;
import com.wowraid.domain.user.dto.response.CharacterResponse;
import com.wowraid.domain.user.service.UserService;
import com.wowraid.global.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PatchMapping("/me/password")
    public ApiResponse<Void> changePassword(@AuthenticationPrincipal UserDetails user,
                                             @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(user.getUsername(), request);
        return ApiResponse.ok("비밀번호가 변경되었습니다.");
    }

    @DeleteMapping("/me")
    public ApiResponse<Void> withdraw(@AuthenticationPrincipal UserDetails user) {
        userService.withdraw(user.getUsername());
        return ApiResponse.ok("회원 탈퇴가 완료되었습니다.");
    }

    @GetMapping("/me/characters")
    public ApiResponse<List<CharacterResponse>> getCharacters(@AuthenticationPrincipal UserDetails user) {
        return ApiResponse.ok(userService.getCharacters(user.getUsername()));
    }

    @PostMapping("/me/characters")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CharacterResponse> addCharacter(@AuthenticationPrincipal UserDetails user,
                                                        @Valid @RequestBody CharacterRequest request) {
        return ApiResponse.ok(userService.addCharacter(user.getUsername(), request));
    }

    @PatchMapping("/me/characters/{id}/main")
    public ApiResponse<Void> setMain(@AuthenticationPrincipal UserDetails user,
                                      @PathVariable UUID id) {
        userService.setMainCharacter(user.getUsername(), id);
        return ApiResponse.ok("대표 캐릭터가 설정되었습니다.");
    }

    @DeleteMapping("/me/characters/{id}")
    public ApiResponse<Void> deleteCharacter(@AuthenticationPrincipal UserDetails user,
                                              @PathVariable UUID id) {
        userService.deleteCharacter(user.getUsername(), id);
        return ApiResponse.ok("캐릭터가 삭제되었습니다.");
    }
}
