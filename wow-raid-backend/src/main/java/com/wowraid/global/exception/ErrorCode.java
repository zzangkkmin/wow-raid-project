package com.wowraid.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Auth
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다."),
    INVALID_RAID_LEADER_CODE(HttpStatus.BAD_REQUEST, "공격대장 인증코드가 올바르지 않습니다."),

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    DUPLICATE_USERNAME(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    EMAIL_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 이메일로 가입된 계정이 없습니다."),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "현재 비밀번호가 올바르지 않습니다."),

    // Character
    CHARACTER_NOT_FOUND(HttpStatus.NOT_FOUND, "캐릭터를 찾을 수 없습니다."),
    CHARACTER_ACCESS_DENIED(HttpStatus.FORBIDDEN, "본인의 캐릭터만 수정할 수 있습니다."),

    // Raid
    RAID_NOT_FOUND(HttpStatus.NOT_FOUND, "레이드를 찾을 수 없습니다."),
    RAID_ACCESS_DENIED(HttpStatus.FORBIDDEN, "레이드 생성자만 수정/삭제할 수 있습니다."),
    RAID_ALREADY_CLOSED(HttpStatus.BAD_REQUEST, "이미 마감된 레이드입니다."),

    // Registration
    REGISTRATION_NOT_FOUND(HttpStatus.NOT_FOUND, "신청 내역을 찾을 수 없습니다."),
    DUPLICATE_REGISTRATION(HttpStatus.CONFLICT, "이미 신청한 레이드입니다."),
    REGISTRATION_ACCESS_DENIED(HttpStatus.FORBIDDEN, "본인의 신청만 수정/취소할 수 있습니다."),
    SELF_REGISTRATION_DENIED(HttpStatus.BAD_REQUEST, "본인이 생성한 레이드에는 신청할 수 없습니다."),
    ALREADY_ABSENT(HttpStatus.BAD_REQUEST, "이미 불참 처리된 신청입니다."),

    // Guest Registration
    GUEST_AUTH_FAILED(HttpStatus.UNAUTHORIZED, "이름 또는 비밀번호가 올바르지 않습니다."),

    // Post
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."),
    POST_ACCESS_DENIED(HttpStatus.FORBIDDEN, "본인의 게시글만 수정/삭제할 수 있습니다."),
    NOTICE_WRITE_DENIED(HttpStatus.FORBIDDEN, "공지사항은 관리자만 작성할 수 있습니다."),

    // Admin
    CANNOT_CHANGE_ADMIN_ROLE(HttpStatus.BAD_REQUEST, "관리자 역할은 변경할 수 없습니다."),

    // Common
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String message;
}
