package com.wowraid.domain.user.service;

import com.wowraid.domain.user.dto.request.ChangePasswordRequest;
import com.wowraid.domain.user.dto.request.CharacterRequest;
import com.wowraid.domain.user.dto.response.CharacterResponse;
import com.wowraid.domain.user.entity.User;
import com.wowraid.domain.user.entity.UserCharacter;
import com.wowraid.domain.user.repository.UserCharacterRepository;
import com.wowraid.domain.user.repository.UserRepository;
import com.wowraid.global.exception.BusinessException;
import com.wowraid.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserCharacterRepository characterRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = findUser(username);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }
        user.changePassword(passwordEncoder.encode(request.newPassword()));
    }

    @Transactional
    public void withdraw(String username) {
        User user = findUser(username);
        user.softDelete();
    }

    @Transactional(readOnly = true)
    public List<CharacterResponse> getCharacters(String username) {
        User user = findUser(username);
        return characterRepository.findAllByUserId(user.getId())
                .stream().map(CharacterResponse::from).toList();
    }

    @Transactional
    public CharacterResponse addCharacter(String username, CharacterRequest request) {
        User user = findUser(username);
        UserCharacter character = UserCharacter.builder()
                .user(user)
                .characterName(request.characterName())
                .wowClass(request.wowClass())
                .wowSpec(request.wowSpec())
                .isMain(false)
                .build();
        return CharacterResponse.from(characterRepository.save(character));
    }

    @Transactional
    public void setMainCharacter(String username, UUID characterId) {
        User user = findUser(username);
        UserCharacter character = characterRepository.findActiveById(characterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHARACTER_NOT_FOUND));
        if (!character.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.CHARACTER_ACCESS_DENIED);
        }
        characterRepository.clearMainByUserId(user.getId());
        character.setMain(true);
    }

    @Transactional
    public void deleteCharacter(String username, UUID characterId) {
        User user = findUser(username);
        UserCharacter character = characterRepository.findActiveById(characterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHARACTER_NOT_FOUND));
        if (!character.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.CHARACTER_ACCESS_DENIED);
        }
        character.softDelete();
    }

    public User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
