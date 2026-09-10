package com.awardhub.awardhub.voting.dto;

import jakarta.validation.constraints.NotNull;

public class CastVoteRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Nominee ID is required")
    private Long nomineeId;

    public CastVoteRequest() {}

    public CastVoteRequest(Long categoryId, Long nomineeId) {
        this.categoryId = categoryId;
        this.nomineeId = nomineeId;
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
}
