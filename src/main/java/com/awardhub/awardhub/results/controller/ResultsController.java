package com.awardhub.awardhub.results.controller;

import com.awardhub.awardhub.common.dto.ApiResponse;
import com.awardhub.awardhub.results.dto.FinalScoreResponse;
import com.awardhub.awardhub.results.service.ResultsService;
import com.awardhub.awardhub.user.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class ResultsController {

    private final ResultsService resultsService;

    public ResultsController(ResultsService resultsService) {
        this.resultsService = resultsService;
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<FinalScoreResponse>>> getResultsByCategory(
            @PathVariable Long categoryId
    ) {
        List<FinalScoreResponse> results = resultsService.getResultsByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @PostMapping("/category/{categoryId}/publish")
    @PreAuthorize("hasAnyRole('AWARD_ORGANIZER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<Void>> publishResults(
            @PathVariable Long categoryId,
            @AuthenticationPrincipal User user
    ) {
        resultsService.calculateAndPublishResults(categoryId, user.getUserID());
        return ResponseEntity.ok(ApiResponse.success("Results calculated and published", null));
    }
}
