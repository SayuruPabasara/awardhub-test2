package com.awardhub.awardhub.category.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * AwardCategory entity represents an award category in the AwardHub platform.
 * Categorizes Nominations, scopes Votes, defines EvaluationCriteria, and ranks Results.
 */
@Entity
@Table(name = "award_categories")
public class AwardCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "category_name", nullable = false, unique = true, length = 150)
    private String categoryName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "eligibility_criteria", columnDefinition = "TEXT")
    private String eligibilityCriteria;

    @Column(name = "nomination_deadline")
    private LocalDateTime nominationDeadline;

    @Column(name = "voting_start_date")
    private LocalDateTime votingStartDate;

    @Column(name = "voting_end_date")
    private LocalDateTime votingEndDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "evaluation_method", nullable = false, length = 30)
    private EvaluationMethod evaluationMethod = EvaluationMethod.HYBRID;

    @Column(name = "voting_weightage")
    private Double votingWeightage = 50.0;

    @Column(name = "judging_weightage")
    private Double judgingWeightage = 50.0;

    @Column(name = "max_votes_per_voter")
    private Integer maxVotesPerVoter = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private CategoryStatus status = CategoryStatus.DRAFT;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "category_required_documents", joinColumns = @JoinColumn(name = "category_id"))
    @Column(name = "document_type")
    private List<String> requiredDocumentTypes = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public AwardCategory() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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
