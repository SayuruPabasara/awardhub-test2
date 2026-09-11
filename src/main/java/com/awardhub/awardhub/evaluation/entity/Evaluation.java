package com.awardhub.awardhub.evaluation.entity;

import com.awardhub.awardhub.category.entity.AwardCategory;
import com.awardhub.awardhub.nomination.entity.Nomination;
import com.awardhub.awardhub.user.entity.Judge;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Evaluation entity — Judge scoring of Nomination against Rubric criteria.
 * Contains individual criterion scores and calculated total weighted score.
 */
@Entity
@Table(name = "evaluations")
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "evaluation_id")
    private Long evaluationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nomination_id", nullable = false)
    private Nomination nomination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "judge_id", nullable = false)
    private Judge judge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private AwardCategory category;

    @Column(name = "submission_date", nullable = false)
    private LocalDateTime submissionDate;

    @Column(name = "total_score")
    private Double totalScore;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "PENDING";

    // JSON storage of criterion scores: {innovation: 85, impact: 90, ...}
    @Column(name = "criterion_scores", columnDefinition = "TEXT")
    private String criterionScores = "{}";

    @Column(name = "comments", length = 2000)
    private String comments;

    public Evaluation() {}

    @PrePersist
    protected void onCreate() {
        this.submissionDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getEvaluationId() {
        return evaluationId;
    }

    public void setEvaluationId(Long evaluationId) {
        this.evaluationId = evaluationId;
    }

    public Nomination getNomination() {
        return nomination;
    }

    public void setNomination(Nomination nomination) {
        this.nomination = nomination;
    }

    public Judge getJudge() {
        return judge;
    }

    public void setJudge(Judge judge) {
        this.judge = judge;
    }

    public AwardCategory getCategory() {
        return category;
    }

    public void setCategory(AwardCategory category) {
        this.category = category;
    }

    public LocalDateTime getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(LocalDateTime submissionDate) {
        this.submissionDate = submissionDate;
    }

    public Double getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(Double totalScore) {
        this.totalScore = totalScore;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCriterionScores() {
        return criterionScores;
    }

    public void setCriterionScores(String criterionScores) {
        this.criterionScores = criterionScores;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
