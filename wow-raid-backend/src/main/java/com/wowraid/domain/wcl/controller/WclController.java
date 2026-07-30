package com.wowraid.domain.wcl.controller;

import com.wowraid.domain.wcl.dto.WclRankingResponse;
import com.wowraid.domain.wcl.service.WclService;
import com.wowraid.global.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wcl")
@RequiredArgsConstructor
public class WclController {

    private final WclService wclService;

    @GetMapping("/character")
    public ApiResponse<WclRankingResponse> getCharacterRankings(
            @RequestParam String server,
            @RequestParam String name
    ) {
        return ApiResponse.ok(wclService.getCharacterRankings(server, name));
    }
}
