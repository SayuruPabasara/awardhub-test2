package com.awardhub.awardhub.evaluation.controller;

import com.awardhub.awardhub.common.dto.ApiResponse;
import com.awardhub.awardhub.evaluation.dto.EvaluationRequest;
import com.awardhub.awardhub.evaluation.dto.EvaluationResponse;
import com.awardhub.awardhub.evaluation.service.EvaluationService;
import com.awardhub.awardhub.user.entity.User;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {

    private final EvaluationService evaluationService;

    public EvaluationController(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('JUDGE')")
    public ResponseEntity<ApiResponse<List<EvaluationResponse>>> getMyAssignments(
            @AuthenticationPrincipal User user
    ) {
        List<EvaluationResponse> evaluations = evaluationService.getMyAssignments(user.getUserID());
        return ResponseEntity.ok(ApiResponse.success(evaluations));
    }

    @GetMapping("/my/pending")
    @PreAuthorize("hasRole('JUDGE')")
    public ResponseEntity<ApiResponse<List<EvaluationResponse>>> getPendingAssignments(
            @AuthenticationPrincipal User user
    ) {
        List<EvaluationResponse> evaluations = evaluationService.getPendingAssignments(user.getUserID());
        return ResponseEntity.ok(ApiResponse.success(evaluations));
    }

    @PostMapping("/{evaluationId}/submit")
    @PreAuthorize("hasRole('JUDGE')")
    public ResponseEntity<ApiResponse<EvaluationResponse>> submitEvaluation(
            @PathVariable Long evaluationId,
            @Valid @RequestBody EvaluationRequest request,
            @AuthenticationPrincipal User user
    ) {
        EvaluationResponse response = evaluationService.submitEvaluation(evaluationId, user.getUserID(), request);
        return ResponseEntity.ok(ApiResponse.success("Evaluation submitted successfully", response));
    }
}
