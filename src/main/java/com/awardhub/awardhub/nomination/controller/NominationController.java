package com.awardhub.awardhub.nomination.controller;

import com.awardhub.awardhub.common.dto.ApiResponse;
import com.awardhub.awardhub.nomination.dto.DocumentResponse;
import com.awardhub.awardhub.nomination.dto.NominationRequest;
import com.awardhub.awardhub.nomination.dto.NominationResponse;
import com.awardhub.awardhub.nomination.dto.ReviewNominationRequest;
import com.awardhub.awardhub.nomination.entity.NominationStatus;
import com.awardhub.awardhub.nomination.service.NominationService;
import com.awardhub.awardhub.user.entity.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/nominations")
public class NominationController {

    private final NominationService nominationService;

    public NominationController(NominationService nominationService) {
        this.nominationService = nominationService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('AWARD_ORGANIZER', 'SYSTEM_ADMINISTRATOR', 'JUDGE')")
    public ResponseEntity<ApiResponse<List<NominationResponse>>> getAllNominations(
            @RequestParam(required = false) NominationStatus status
    ) {
        List<NominationResponse> list = nominationService.getAllNominations(status);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('NOMINEE')")
    public ResponseEntity<ApiResponse<List<NominationResponse>>> getMyNominations(
            @AuthenticationPrincipal User user
    ) {
        List<NominationResponse> list = nominationService.getNominationsByNominee(user.getUserID());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<NominationResponse>>> getNominationsByCategory(
            @PathVariable Long categoryId
    ) {
        List<NominationResponse> list = nominationService.getNominationsByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/category/{categoryId}/approved")
    public ResponseEntity<ApiResponse<List<NominationResponse>>> getApprovedNominations(
            @PathVariable Long categoryId
    ) {
        List<NominationResponse> list = nominationService.getApprovedNominationsForCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NominationResponse>> getNominationById(@PathVariable Long id) {
        NominationResponse response = nominationService.getNominationById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('NOMINEE')")
    public ResponseEntity<ApiResponse<NominationResponse>> createNomination(
            @Valid @RequestBody NominationRequest request,
            @AuthenticationPrincipal User user
    ) {
        NominationResponse created = nominationService.createNomination(request, user.getUserID());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Nomination created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('NOMINEE')")
    public ResponseEntity<ApiResponse<NominationResponse>> updateNomination(
            @PathVariable Long id,
            @Valid @RequestBody NominationRequest request,
            @AuthenticationPrincipal User user
    ) {
        NominationResponse updated = nominationService.updateNomination(id, request, user.getUserID());
        return ResponseEntity.ok(ApiResponse.success("Nomination updated successfully", updated));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('NOMINEE')")
    public ResponseEntity<ApiResponse<NominationResponse>> submitNomination(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        NominationResponse submitted = nominationService.submitNomination(id, user.getUserID());
        return ResponseEntity.ok(ApiResponse.success("Nomination submitted for organizer review", submitted));
    }

    @PostMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('NOMINEE')")
    public ResponseEntity<ApiResponse<NominationResponse>> withdrawNomination(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        NominationResponse withdrawn = nominationService.withdrawNomination(id, user.getUserID());
        return ResponseEntity.ok(ApiResponse.success("Nomination withdrawn", withdrawn));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('AWARD_ORGANIZER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<NominationResponse>> reviewNomination(
            @PathVariable Long id,
            @Valid @RequestBody ReviewNominationRequest request,
            @AuthenticationPrincipal User user
    ) {
        NominationResponse reviewed = nominationService.reviewNomination(id, request, user.getUserID());
        return ResponseEntity.ok(ApiResponse.success("Nomination review completed: " + request.getDecision(), reviewed));
    }

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('NOMINEE')")
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(
            @PathVariable Long id,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user
    ) {
        DocumentResponse doc = nominationService.uploadDocument(id, documentType, file, user.getUserID());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document uploaded successfully", doc));
    }

    @DeleteMapping("/documents/{documentId}")
    @PreAuthorize("hasRole('NOMINEE')")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal User user
    ) {
        nominationService.deleteDocument(documentId, user.getUserID());
        return ResponseEntity.ok(ApiResponse.success("Document deleted", null));
    }
}
