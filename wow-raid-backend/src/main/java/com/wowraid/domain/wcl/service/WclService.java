package com.wowraid.domain.wcl.service;

import com.wowraid.domain.wcl.dto.WclRankingResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Service
@RequiredArgsConstructor
public class WclService {

    @Value("${wcl.client-id}")
    private String clientId;

    @Value("${wcl.client-secret}")
    private String clientSecret;

    private final WebClient webClient = WebClient.builder().build();

    // 토큰 인메모리 캐시 (만료 시각 포함)
    private final AtomicReference<String> cachedToken = new AtomicReference<>();
    private volatile long tokenExpiresAt = 0;

    // 한글 서버명 → WCL 슬러그 매핑
    private static final Map<String, String> SERVER_SLUG = Map.ofEntries(
            Map.entry("아즈샤라",    "azshara"),
            Map.entry("가로나",      "garona"),
            Map.entry("노르간논",    "norgannon"),
            Map.entry("달라란",      "dalaran"),
            Map.entry("데스윙",      "deathwing"),
            Map.entry("듀로탄",      "durotan"),
            Map.entry("렉사르",      "rexxar"),
            Map.entry("말퓨리온",    "malfurion"),
            Map.entry("불타는 군단", "burning-legion"),
            Map.entry("세나리우스",  "cenarius"),
            Map.entry("스톰레이지",  "stormrage"),
            Map.entry("알렉스트라자","alexstrasza"),
            Map.entry("와일드해머",  "wildhammer"),
            Map.entry("윈드러너",    "windrunner"),
            Map.entry("하이잘",      "hyjal"),
            Map.entry("헬스크림",    "hellscream")
    );

    @Cacheable(value = "wclCharacter", key = "#server + ':' + #characterName")
    public WclRankingResponse getCharacterRankings(String server, String characterName) {
        String serverSlug = SERVER_SLUG.getOrDefault(server, server.toLowerCase());
        String token = getAccessToken();

        String query = """
            {
              characterData {
                character(name: "%s", serverSlug: "%s", serverRegion: "kr") {
                  zoneRankings
                }
              }
            }
            """.formatted(characterName, serverSlug);

        Map<?, ?> response = webClient.post()
                .uri("https://www.warcraftlogs.com/api/v2/client")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("query", query))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        return parseResponse(response, characterName, server);
    }

    @SuppressWarnings("unchecked")
    private WclRankingResponse parseResponse(Map<?, ?> response, String characterName, String server) {
        try {
            Map<?, ?> data = (Map<?, ?>) response.get("data");
            Map<?, ?> characterData = (Map<?, ?>) data.get("characterData");
            Map<?, ?> character = (Map<?, ?>) characterData.get("character");

            if (character == null) {
                return new WclRankingResponse(characterName, server, null, List.of());
            }

            Map<?, ?> zoneRankings = (Map<?, ?>) character.get("zoneRankings");
            List<?> rankings = (List<?>) zoneRankings.get("rankings");

            Double bestAvg = zoneRankings.get("bestPerformanceAverage") != null
                    ? ((Number) zoneRankings.get("bestPerformanceAverage")).doubleValue()
                    : null;

            if (rankings == null) {
                return new WclRankingResponse(characterName, server, bestAvg, List.of());
            }

            List<WclRankingResponse.EncounterRanking> result = rankings.stream()
                    .filter(r -> ((Map<?, ?>) r).get("rankPercent") != null)
                    .map(r -> {
                        Map<?, ?> rank = (Map<?, ?>) r;
                        Map<?, ?> encounter = (Map<?, ?>) rank.get("encounter");
                        String name = (String) encounter.get("name");
                        double pct = ((Number) rank.get("rankPercent")).doubleValue();
                        return new WclRankingResponse.EncounterRanking(name, pct);
                    })
                    .toList();

            return new WclRankingResponse(characterName, server, bestAvg, result);
        } catch (Exception e) {
            log.error("WCL 응답 파싱 실패: {}", e.getMessage(), e);
            return new WclRankingResponse(characterName, server, null, List.of());
        }
    }

    private String getAccessToken() {
        if (cachedToken.get() != null && System.currentTimeMillis() < tokenExpiresAt - 60_000) {
            return cachedToken.get();
        }

        String credentials = Base64.getEncoder().encodeToString((clientId + ":" + clientSecret).getBytes());

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");

        Map<?, ?> tokenResponse = webClient.post()
                .uri("https://www.warcraftlogs.com/oauth/token")
                .header("Authorization", "Basic " + credentials)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(form))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        String token = (String) tokenResponse.get("access_token");
        int expiresIn = ((Number) tokenResponse.get("expires_in")).intValue();

        cachedToken.set(token);
        tokenExpiresAt = System.currentTimeMillis() + expiresIn * 1000L;

        return token;
    }
}
