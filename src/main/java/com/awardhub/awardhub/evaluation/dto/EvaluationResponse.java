package com.awardhub.awardhub.evaluation.dto;

import com.awardhub.awardhub.evaluation.entity.Evaluation;
import java.time.LocalDateTime;
import java.util.Map;

public class EvaluationResponse {
    private Long evaluationId;
    private Long nominationId;
    private Long judgeId;
    private Long categoryId;
    private LocalDateTime submissionDate;
    private Double totalScore;
    private String status;
    private Map<String, Integer> criterionScores;
    private String comments;

    public static EvaluationResponse fromEntity(Evaluation evaluation) {
        EvaluationResponse dto = new EvaluationResponse();
        dto.evaluationId = evaluation.getEvaluationId();
        dto.nominationId = evaluation.getNomination().getNominationId();
        dto.judgeId = evaluation.getJudge().getUserID();
        dto.categoryId = evaluation.getCategory().getCategoryId();
        dto.submissionDate = evaluation.getSubmissionDate();
        dto.totalScore = evaluation.getTotalScore();
        dto.status = evaluation.getStatus();
        dto.comments = evaluation.getComments();
        return dto;
    }

    // Getters and Setters
    public Long getEvaluationId() {
        return evaluationId;
    }

    public void setEvaluationId(Long evaluationId) {
        this.evaluationId = evaluationId;
    }

    public Long getNominationId() {
        return nominationId;
    }

    public void setNominationId(Long nominationId) {
        this.nominationId = nominationId;
    }

    public Long getJudgeId() {
        return judgeId;
    }

    public void setJudgeId(Long judgeId) {
        this.judgeId = judgeId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
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

    public Map<String, Integer> getCriterionScores() {
        return criterionScores;
    }

    public void setCriterionScores(Map<String, Integer> criterionScores) {
        this.criterionScores = criterionScores;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
