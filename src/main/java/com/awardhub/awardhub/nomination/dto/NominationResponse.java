package com.awardhub.awardhub.nomination.dto;

import com.awardhub.awardhub.nomination.entity.Nomination;
import com.awardhub.awardhub.nomination.entity.NominationStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class NominationResponse {

    private Long nominationId;
    private Long nomineeId;
    private String nomineeName;
    private String nomineeEmail;
    private Long categoryId;
    private String categoryName;
    private String title;
    private String achievementDescription;
    private String evidenceDetails;
    private Boolean declaration;
    private LocalDateTime submissionDate;
    private NominationStatus status;
    private LocalDateTime reviewDate;
    private String rejectionReason;
    private Long reviewedById;
    private List<DocumentResponse> documents = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public NominationResponse() {}

    public static NominationResponse fromEntity(Nomination nom) {
        NominationResponse dto = new NominationResponse();
        dto.setNominationId(nom.getNominationId());
        if (nom.getNominee() != null) {
            dto.setNomineeId(nom.getNominee().getUserID());
            dto.setNomineeEmail(nom.getNominee().getEmail());
            dto.setNomineeName(nom.getNominee().getEmail()); // Fallback or name
        }
        if (nom.getCategory() != null) {
            dto.setCategoryId(nom.getCategory().getCategoryId());
            dto.setCategoryName(nom.getCategory().getCategoryName());
        }
        dto.setTitle(nom.getTitle());
        dto.setAchievementDescription(nom.getAchievementDescription());
        dto.setEvidenceDetails(nom.getEvidenceDetails());
        dto.setDeclaration(nom.getDeclaration());
        dto.setSubmissionDate(nom.getSubmissionDate());
        dto.setStatus(nom.getStatus());
        dto.setReviewDate(nom.getReviewDate());
        dto.setRejectionReason(nom.getRejectionReason());
        if (nom.getReviewedBy() != null) {
            dto.setReviewedById(nom.getReviewedBy().getUserID());
        }
        if (nom.getDocuments() != null) {
            dto.setDocuments(
                    nom.getDocuments().stream().map(DocumentResponse::fromEntity).collect(Collectors.toList())
            );
        }
        dto.setCreatedAt(nom.getCreatedAt());
        dto.setUpdatedAt(nom.getUpdatedAt());
        return dto;
    }

    // Getters and Setters

    public Long getNominationId() {
        return nominationId;
    }

    public void setNominationId(Long nominationId) {
        this.nominationId = nominationId;
    }

    public Long getNomineeId() {
        return nomineeId;
    }

    public void setNomineeId(Long nomineeId) {
        this.nomineeId = nomineeId;
    }

    public String getNomineeName() {
        return nomineeName;
    }

    public void setNomineeName(String nomineeName) {
        this.nomineeName = nomineeName;
    }

    public String getNomineeEmail() {
        return nomineeEmail;
    }

    public void setNomineeEmail(String nomineeEmail) {
        this.nomineeEmail = nomineeEmail;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAchievementDescription() {
        return achievementDescription;
    }

    public void setAchievementDescription(String achievementDescription) {
        this.achievementDescription = achievementDescription;
    }

    public String getEvidenceDetails() {
        return evidenceDetails;
    }

    public void setEvidenceDetails(String evidenceDetails) {
        this.evidenceDetails = evidenceDetails;
    }

    public Boolean getDeclaration() {
        return declaration;
    }

    public void setDeclaration(Boolean declaration) {
        this.declaration = declaration;
    }

    public LocalDateTime getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(LocalDateTime submissionDate) {
        this.submissionDate = submissionDate;
    }

    public NominationStatus getStatus() {
        return status;
    }

    public void setStatus(NominationStatus status) {
        this.status = status;
    }

    public LocalDateTime getReviewDate() {
        return reviewDate;
    }

    public void setReviewDate(LocalDateTime reviewDate) {
        this.reviewDate = reviewDate;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Long getReviewedById() {
        return reviewedById;
    }

    public void setReviewedById(Long reviewedById) {
        this.reviewedById = reviewedById;
    }

    public List<DocumentResponse> getDocuments() {
        return documents;
    }

    public void setDocuments(List<DocumentResponse> documents) {
        this.documents = documents;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
