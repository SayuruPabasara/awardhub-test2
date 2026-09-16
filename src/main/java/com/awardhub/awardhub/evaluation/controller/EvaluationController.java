package com.awardhub.awardhub.evaluation.controller;

import com.awardhub.awardhub.common.dto.ApiResponse;
import com.awardhub.awardhub.evaluation.dto.EvaluationRequest;
import com.awardhub.awardhub.evaluation.dto.EvaluationResponse;
import com.awardhub.awardhub.evaluation.service.EvaluationService;
import com.awardhub.awardhub.nomination.dto.EvaluationAssignmentRequest;
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

    // ==========================================
    // Judge Endpoints
    // ==========================================

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

    // ==========================================
    // Organizer & Administrator Endpoints
    // ==========================================

    @GetMapping
    @PreAuthorize("hasAnyRole('AWARD_ORGANIZER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<List<EvaluationResponse>>> getAllEvaluations(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long nominationId,
            @RequestParam(required = false) String status
    ) {
        List<EvaluationResponse> evaluations = evaluationService.getAllEvaluations(categoryId, nominationId, status);
        return ResponseEntity.ok(ApiResponse.success(evaluations));
    }

    @GetMapping("/category/{categoryId}")
    @PreAuthorize("hasAnyRole('AWARD_ORGANIZER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<List<EvaluationResponse>>> getEvaluationsByCategory(
            @PathVariable Long categoryId
    ) {
        List<EvaluationResponse> evaluations = evaluationService.getEvaluationsByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(evaluations));
    }

    @GetMapping("/nomination/{nominationId}")
    @PreAuthorize("hasAnyRole('AWARD_ORGANIZER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<List<EvaluationResponse>>> getEvaluationsByNomination(
            @PathVariable Long nominationId
    ) {
        List<EvaluationResponse> evaluations = evaluationService.getEvaluationsByNomination(nominationId);
        return ResponseEntity.ok(ApiResponse.success(evaluations));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('AWARD_ORGANIZER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<List<EvaluationResponse>>> assignJudges(
            @Valid @RequestBody EvaluationAssignmentRequest request,
            @AuthenticationPrincipal User user
    ) {
        List<EvaluationResponse> assigned = evaluationService.assignJudgesToNomination(request, user.getUserID());
        return ResponseEntity.ok(ApiResponse.success("Judges assigned successfully", assigned));
    }

    @DeleteMapping("/{evaluationId}")
    @PreAuthorize("hasAnyRole('AWARD_ORGANIZER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<Void>> unassignJudge(
            @PathVariable Long evaluationId,
            @AuthenticationPrincipal User user
    ) {
        evaluationService.unassignJudge(evaluationId, user.getUserID());
        return ResponseEntity.ok(ApiResponse.success("Judge unassigned successfully", null));
    }
}
