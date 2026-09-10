package com.awardhub.awardhub.results.dto;

public class FinalScoreResponse {
    private Long scoreId;
    private Long nomineeId;
    private String nomineeName;
    private Long categoryId;
    private Double voteScore;
    private Double judgeScore;
    private Double finalScore;
    private Long totalVotes;
    private Long totalEvaluations;
    private Integer rank;
    private Boolean isWinner;

    public FinalScoreResponse() {}

    public FinalScoreResponse(Long scoreId, Long nomineeId, String nomineeName, Long categoryId,
                              Double voteScore, Double judgeScore, Double finalScore,
                              Long totalVotes, Long totalEvaluations, Integer rank, Boolean isWinner) {
        this.scoreId = scoreId;
        this.nomineeId = nomineeId;
        this.nomineeName = nomineeName;
        this.categoryId = categoryId;
        this.voteScore = voteScore;
        this.judgeScore = judgeScore;
        this.finalScore = finalScore;
        this.totalVotes = totalVotes;
        this.totalEvaluations = totalEvaluations;
        this.rank = rank;
        this.isWinner = isWinner;
    }

    // Getters and Setters
    public Long getScoreId() {
        return scoreId;
    }

    public void setScoreId(Long scoreId) {
        this.scoreId = scoreId;
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

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Double getVoteScore() {
        return voteScore;
    }

    public void setVoteScore(Double voteScore) {
        this.voteScore = voteScore;
    }

    public Double getJudgeScore() {
        return judgeScore;
    }

    public void setJudgeScore(Double judgeScore) {
        this.judgeScore = judgeScore;
    }

    public Double getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(Double finalScore) {
        this.finalScore = finalScore;
    }

    public Long getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(Long totalVotes) {
        this.totalVotes = totalVotes;
    }

    public Long getTotalEvaluations() {
        return totalEvaluations;
    }

    public void setTotalEvaluations(Long totalEvaluations) {
        this.totalEvaluations = totalEvaluations;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }

    public Boolean getIsWinner() {
        return isWinner;
    }

    public void setIsWinner(Boolean isWinner) {
        this.isWinner = isWinner;
    }
}
