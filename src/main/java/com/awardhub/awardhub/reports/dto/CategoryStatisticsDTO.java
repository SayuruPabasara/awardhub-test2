package com.awardhub.awardhub.reports.dto;

public class CategoryStatisticsDTO {
    private Long categoryId;
    private String categoryName;
    private Long totalNominations;
    private Long approvedNominations;
    private Long rejectedNominations;
    private Long totalVotes;
    private Long totalEvaluators;
    private Double avgVoteScore;
    private Double avgJudgeScore;

    public CategoryStatisticsDTO() {}

    public CategoryStatisticsDTO(Long categoryId, String categoryName, Long totalNominations,
                                  Long approvedNominations, Long rejectedNominations, Long totalVotes,
                                  Long totalEvaluators, Double avgVoteScore, Double avgJudgeScore) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.totalNominations = totalNominations;
        this.approvedNominations = approvedNominations;
        this.rejectedNominations = rejectedNominations;
        this.totalVotes = totalVotes;
        this.totalEvaluators = totalEvaluators;
        this.avgVoteScore = avgVoteScore;
        this.avgJudgeScore = avgJudgeScore;
    }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Long getTotalNominations() { return totalNominations; }
    public void setTotalNominations(Long totalNominations) { this.totalNominations = totalNominations; }

    public Long getApprovedNominations() { return approvedNominations; }
    public void setApprovedNominations(Long approvedNominations) { this.approvedNominations = approvedNominations; }

    public Long getRejectedNominations() { return rejectedNominations; }
    public void setRejectedNominations(Long rejectedNominations) { this.rejectedNominations = rejectedNominations; }

    public Long getTotalVotes() { return totalVotes; }
    public void setTotalVotes(Long totalVotes) { this.totalVotes = totalVotes; }

    public Long getTotalEvaluators() { return totalEvaluators; }
    public void setTotalEvaluators(Long totalEvaluators) { this.totalEvaluators = totalEvaluators; }

    public Double getAvgVoteScore() { return avgVoteScore; }
    public void setAvgVoteScore(Double avgVoteScore) { this.avgVoteScore = avgVoteScore; }

    public Double getAvgJudgeScore() { return avgJudgeScore; }
    public void setAvgJudgeScore(Double avgJudgeScore) { this.avgJudgeScore = avgJudgeScore; }
}
