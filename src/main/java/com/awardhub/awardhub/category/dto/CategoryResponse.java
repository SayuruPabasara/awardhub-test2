package com.awardhub.awardhub.category.dto;

import com.awardhub.awardhub.category.entity.AwardCategory;
import com.awardhub.awardhub.category.entity.CategoryStatus;
import com.awardhub.awardhub.category.entity.EvaluationMethod;
import java.time.LocalDateTime;
import java.util.List;

public class CategoryResponse {

    private Long categoryId;
    private String categoryName;
    private String description;
    private String eligibilityCriteria;
    private LocalDateTime nominationDeadline;
    private LocalDateTime votingStartDate;
    private LocalDateTime votingEndDate;
    private EvaluationMethod evaluationMethod;
    private Double votingWeightage;
    private Double judgingWeightage;
    private Integer maxVotesPerVoter;
    private CategoryStatus status;
    private List<String> requiredDocumentTypes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CategoryResponse() {}

    public static CategoryResponse fromEntity(AwardCategory category) {
        CategoryResponse dto = new CategoryResponse();
        dto.setCategoryId(category.getCategoryId());
        dto.setCategoryName(category.getCategoryName());
        dto.setDescription(category.getDescription());
        dto.setEligibilityCriteria(category.getEligibilityCriteria());
        dto.setNominationDeadline(category.getNominationDeadline());
        dto.setVotingStartDate(category.getVotingStartDate());
        dto.setVotingEndDate(category.getVotingEndDate());
        dto.setEvaluationMethod(category.getEvaluationMethod());
        dto.setVotingWeightage(category.getVotingWeightage());
        dto.setJudgingWeightage(category.getJudgingWeightage());
        dto.setMaxVotesPerVoter(category.getMaxVotesPerVoter());
        dto.setStatus(category.getStatus());
        dto.setRequiredDocumentTypes(category.getRequiredDocumentTypes());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        return dto;
    }

    // Getters and Setters

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEligibilityCriteria() {
        return eligibilityCriteria;
    }

    public void setEligibilityCriteria(String eligibilityCriteria) {
        this.eligibilityCriteria = eligibilityCriteria;
    }

    public LocalDateTime getNominationDeadline() {
        return nominationDeadline;
    }

    public void setNominationDeadline(LocalDateTime nominationDeadline) {
        this.nominationDeadline = nominationDeadline;
    }

    public LocalDateTime getVotingStartDate() {
        return votingStartDate;
    }

    public void setVotingStartDate(LocalDateTime votingStartDate) {
        this.votingStartDate = votingStartDate;
    }

    public LocalDateTime getVotingEndDate() {
        return votingEndDate;
    }

    public void setVotingEndDate(LocalDateTime votingEndDate) {
        this.votingEndDate = votingEndDate;
    }

    public EvaluationMethod getEvaluationMethod() {
        return evaluationMethod;
    }

    public void setEvaluationMethod(EvaluationMethod evaluationMethod) {
        this.evaluationMethod = evaluationMethod;
    }

    public Double getVotingWeightage() {
        return votingWeightage;
    }

    public void setVotingWeightage(Double votingWeightage) {
        this.votingWeightage = votingWeightage;
    }

    public Double getJudgingWeightage() {
        return judgingWeightage;
    }

    public void setJudgingWeightage(Double judgingWeightage) {
        this.judgingWeightage = judgingWeightage;
    }

    public Integer getMaxVotesPerVoter() {
        return maxVotesPerVoter;
    }

    public void setMaxVotesPerVoter(Integer maxVotesPerVoter) {
        this.maxVotesPerVoter = maxVotesPerVoter;
    }

    public CategoryStatus getStatus() {
        return status;
    }

    public void setStatus(CategoryStatus status) {
        this.status = status;
    }

    public List<String> getRequiredDocumentTypes() {
        return requiredDocumentTypes;
    }

    public void setRequiredDocumentTypes(List<String> requiredDocumentTypes) {
        this.requiredDocumentTypes = requiredDocumentTypes;
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
