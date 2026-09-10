package com.awardhub.awardhub.nomination.entity;

import com.awardhub.awardhub.category.entity.AwardCategory;
import com.awardhub.awardhub.user.entity.Nominee;
import com.awardhub.awardhub.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Nomination entity submitted by a Nominee for an AwardCategory.
 * Evaluated by Judges and yields an official Result.
 */
@Entity
@Table(name = "nominations")
public class Nomination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "nomination_id")
    private Long nominationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nominee_id", nullable = false)
    private Nominee nominee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private AwardCategory category;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "achievement_description", nullable = false, columnDefinition = "TEXT")
    private String achievementDescription;

    @Column(name = "evidence_details", columnDefinition = "TEXT")
    private String evidenceDetails;

    @Column(name = "declaration", nullable = false)
    private Boolean declaration = false;

    @Column(name = "submission_date")
    private LocalDateTime submissionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private NominationStatus status = NominationStatus.DRAFT;

    @Column(name = "review_date")
    private LocalDateTime reviewDate;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @OneToMany(mappedBy = "nomination", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Document> documents = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Nomination() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == NominationStatus.SUBMITTED && this.submissionDate == null) {
            this.submissionDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addDocument(Document doc) {
        documents.add(doc);
        doc.setNomination(this);
    }

    public void removeDocument(Document doc) {
        documents.remove(doc);
        doc.setNomination(null);
    }

    // Getters and Setters

    public Long getNominationId() {
        return nominationId;
    }

    public void setNominationId(Long nominationId) {
        this.nominationId = nominationId;
    }

    public Nominee getNominee() {
        return nominee;
    }

    public void setNominee(Nominee nominee) {
        this.nominee = nominee;
    }

    public AwardCategory getCategory() {
        return category;
    }

    public void setCategory(AwardCategory category) {
        this.category = category;
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

    public User getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(User reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public List<Document> getDocuments() {
        return documents;
    }

    public void setDocuments(List<Document> documents) {
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
