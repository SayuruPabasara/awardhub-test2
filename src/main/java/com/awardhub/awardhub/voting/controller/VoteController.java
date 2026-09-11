package com.awardhub.awardhub.voting.controller;

import com.awardhub.awardhub.common.dto.ApiResponse;
import com.awardhub.awardhub.user.entity.User;
import com.awardhub.awardhub.voting.dto.CastVoteRequest;
import com.awardhub.awardhub.voting.dto.VoteResponse;
import com.awardhub.awardhub.voting.service.VoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('VOTER')")
    public ResponseEntity<ApiResponse<List<VoteResponse>>> getMyVotes(
            @AuthenticationPrincipal User user
    ) {
        List<VoteResponse> votes = voteService.getMyVotes(user.getUserID());
        return ResponseEntity.ok(ApiResponse.success(votes));
    }

    @GetMapping("/category/{categoryId}")
    @PreAuthorize("hasAnyRole('AWARD_ORGANIZER', 'SYSTEM_ADMINISTRATOR', 'JUDGE')")
    public ResponseEntity<ApiResponse<List<VoteResponse>>> getVotesByCategory(
            @PathVariable Long categoryId
    ) {
        List<VoteResponse> votes = voteService.getVotesByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(votes));
    }

    @PostMapping
    @PreAuthorize("hasRole('VOTER')")
    public ResponseEntity<ApiResponse<VoteResponse>> submitVote(
            @Valid @RequestBody CastVoteRequest request,
            @AuthenticationPrincipal User user
    ) {
        VoteResponse response = voteService.submitVote(user.getUserID(), request.getCategoryId(), request.getNomineeId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vote submitted successfully", response));
    }
}
