package com.awardhub.awardhub.evaluation.dto;

import com.awardhub.awardhub.category.entity.AwardCategory;
import com.awardhub.awardhub.category.entity.RubricCriterion;
import com.awardhub.awardhub.evaluation.entity.Evaluation;
import com.awardhub.awardhub.nomination.entity.Nomination;
import com.awardhub.awardhub.user.entity.Judge;
import com.awardhub.awardhub.user.entity.Nominee;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class EvaluationResponse {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private Long evaluationId;
    private Long nominationId;
    private Long judgeId;
    private Long categoryId;
    private LocalDateTime submissionDate;
    private Double totalScore;
    private String status;
    private Map<String, Integer> criterionScores;
    private String comments;

    // Nominee info
    private Long nomineeId;
    private String nomineeName;
    private String nomineeEmail;

    // Category info
    private String categoryName;

    // Nomination info
    private String nominationTitle;
    private String nominationSummary;

    // Judge info
    private String judgeName;
    private String judgeEmail;

    // Timeline & Rubric
    private LocalDateTime dueDate;
    private List<RubricCriterion> rubric;

    public static EvaluationResponse fromEntity(Evaluation evaluation) {
        EvaluationResponse dto = new EvaluationResponse();
        dto.evaluationId = evaluation.getEvaluationId();
        dto.submissionDate = evaluation.getSubmissionDate();
        dto.totalScore = evaluation.getTotalScore();
        dto.status = evaluation.getStatus();
        dto.comments = evaluation.getComments();

        // Nomination & Nominee
        Nomination nomination = evaluation.getNomination();
        if (nomination != null) {
            dto.nominationId = nomination.getNominationId();
            dto.nominationTitle = nomination.getTitle();
            dto.nominationSummary = nomination.getAchievementDescription();

            Nominee nominee = nomination.getNominee();
            if (nominee != null) {
                dto.nomineeId = nominee.getUserID();
                dto.nomineeEmail = nominee.getEmail();
                if (nominee.getJobTitle() != null && !nominee.getJobTitle().isBlank()) {
                    dto.nomineeName = nominee.getEmail().split("@")[0] + " (" + nominee.getJobTitle() + ")";
                } else {
                    dto.nomineeName = nominee.getEmail();
                }
            }
        }

        // Judge
        Judge judge = evaluation.getJudge();
        if (judge != null) {
            dto.judgeId = judge.getUserID();
            dto.judgeEmail = judge.getEmail();
            if (judge.getAreaOfExpertise() != null && !judge.getAreaOfExpertise().isBlank()) {
                dto.judgeName = judge.getEmail().split("@")[0] + " (" + judge.getAreaOfExpertise() + ")";
            } else {
                dto.judgeName = judge.getEmail();
            }
        }

        // Category & Rubric
        AwardCategory category = evaluation.getCategory();
        if (category != null) {
            dto.categoryId = category.getCategoryId();
            dto.categoryName = category.getCategoryName();
            dto.dueDate = category.getVotingEndDate() != null ? category.getVotingEndDate() : category.getNominationDeadline();
            if (category.getRubricCriteria() != null && !category.getRubricCriteria().isEmpty()) {
                dto.rubric = category.getRubricCriteria();
            } else {
                dto.rubric = AwardCategory.getDefaultRubric();
            }
        } else {
            dto.rubric = AwardCategory.getDefaultRubric();
        }

        // Parse criterionScores JSON string
        if (evaluation.getCriterionScores() != null && !evaluation.getCriterionScores().isBlank()) {
            try {
                dto.criterionScores = OBJECT_MAPPER.readValue(
                        evaluation.getCriterionScores(),
                        new TypeReference<Map<String, Integer>>() {}
                );
            } catch (Exception e) {
                dto.criterionScores = Collections.emptyMap();
            }
        } else {
            dto.criterionScores = Collections.emptyMap();
        }

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

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getNominationTitle() {
        return nominationTitle;
    }

    public void setNominationTitle(String nominationTitle) {
        this.nominationTitle = nominationTitle;
    }

    public String getNominationSummary() {
        return nominationSummary;
    }

    public void setNominationSummary(String nominationSummary) {
        this.nominationSummary = nominationSummary;
    }

    public String getJudgeName() {
        return judgeName;
    }

    public void setJudgeName(String judgeName) {
        this.judgeName = judgeName;
    }

    public String getJudgeEmail() {
        return judgeEmail;
    }

    public void setJudgeEmail(String judgeEmail) {
        this.judgeEmail = judgeEmail;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public List<RubricCriterion> getRubric() {
        return rubric;
    }

    public void setRubric(List<RubricCriterion> rubric) {
        this.rubric = rubric;
    }
}
