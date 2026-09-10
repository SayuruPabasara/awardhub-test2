package com.awardhub.awardhub.nomination.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class NominationRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "Nomination title is required")
    private String title;

    @NotBlank(message = "Achievement description is required")
    private String achievementDescription;

    private String evidenceDetails;

    @NotNull(message = "Declaration must be accepted")
    private Boolean declaration;

    private boolean submitImmediately = false;

    public NominationRequest() {}

    // Getters and Setters

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
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

    public boolean isSubmitImmediately() {
        return submitImmediately;
    }

    public void setSubmitImmediately(boolean submitImmediately) {
        this.submitImmediately = submitImmediately;
    }
}
