package com.wowraid.domain.user.dto.response;

import com.wowraid.domain.registration.enums.WowClass;
import com.wowraid.domain.registration.enums.WowSpec;
import com.wowraid.domain.user.entity.UserCharacter;

import java.util.UUID;

public record CharacterResponse(
        UUID id,
        String characterName,
        WowClass wowClass,
        WowSpec wowSpec,
        boolean isMain
) {
    public static CharacterResponse from(UserCharacter character) {
        return new CharacterResponse(
                character.getId(),
                character.getCharacterName(),
                character.getWowClass(),
                character.getWowSpec(),
                character.isMain()
        );
    }
}
