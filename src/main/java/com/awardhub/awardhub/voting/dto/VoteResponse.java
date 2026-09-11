package com.awardhub.awardhub.voting.dto;

import java.time.LocalDateTime;

public class VoteResponse {
    private Long voteId;
    private Long categoryId;
    private Long nomineeId;
    private Long voterId;
    private LocalDateTime voteTimestamp;
    private String status;

    public VoteResponse() {}

    public VoteResponse(Long voteId, Long categoryId, Long nomineeId, Long voterId, LocalDateTime voteTimestamp, String status) {
        this.voteId = voteId;
        this.categoryId = categoryId;
        this.nomineeId = nomineeId;
        this.voterId = voterId;
        this.voteTimestamp = voteTimestamp;
        this.status = status;
    }

    public Long getVoteId() {
        return voteId;
    }

    public void setVoteId(Long voteId) {
        this.voteId = voteId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getNomineeId() {
        return nomineeId;
    }

    public void setNomineeId(Long nomineeId) {
        this.nomineeId = nomineeId;
    }

    public Long getVoterId() {
        return voterId;
    }

    public void setVoterId(Long voterId) {
        this.voterId = voterId;
    }

    public LocalDateTime getVoteTimestamp() {
        return voteTimestamp;
    }

    public void setVoteTimestamp(LocalDateTime voteTimestamp) {
        this.voteTimestamp = voteTimestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
