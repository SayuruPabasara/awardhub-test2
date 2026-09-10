package com.awardhub.awardhub.results.entity;

import com.awardhub.awardhub.category.entity.AwardCategory;
import com.awardhub.awardhub.user.entity.Nominee;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * FinalScore entity — Calculated combined score for a nominee in a category.
 * Combines voting score and judge evaluation score based on evaluation method.
 */
@Entity
@Table(name = "final_scores", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"nominee_id", "category_id"})
})
public class FinalScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "score_id")
    private Long scoreId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nominee_id", nullable = false)
    private Nominee nominee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private AwardCategory category;

    @Column(name = "vote_score")
    private Double voteScore = 0.0;

    @Column(name = "judge_score")
    private Double judgeScore = 0.0;

    @Column(name = "final_score", nullable = false)
    private Double finalScore = 0.0;

    @Column(name = "total_votes")
    private Long totalVotes = 0L;

    @Column(name = "total_evaluations")
    private Long totalEvaluations = 0L;

    @Column(name = "rank")
    private Integer rank;

    @Column(name = "is_winner")
    private Boolean isWinner = false;

    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;

    public FinalScore() {}

    @PrePersist
    protected void onCreate() {
        this.calculatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getScoreId() {
        return scoreId;
    }

    public void setScoreId(Long scoreId) {
        this.scoreId = scoreId;
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

    public LocalDateTime getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(LocalDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }
}
