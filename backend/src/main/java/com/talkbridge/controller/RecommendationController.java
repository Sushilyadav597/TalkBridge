package com.talkbridge.controller;

import com.talkbridge.dto.RecommendationDTO;
import com.talkbridge.entity.User;
import com.talkbridge.service.RecommendationService;
import com.talkbridge.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserService userService;

    public RecommendationController(RecommendationService recommendationService, UserService userService) {
        this.recommendationService = recommendationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<RecommendationDTO>> getRecommendations(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "10") int limit
    ) {
        User currentUser = userService.getEntityByEmail(userDetails.getUsername());
        List<RecommendationDTO> recommendations = recommendationService.getRecommendationsForUser(currentUser, limit);
        return ResponseEntity.ok(recommendations);
    }
}
