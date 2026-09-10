package com.awardhub.awardhub.nomination.dto;

import com.awardhub.awardhub.nomination.entity.NominationStatus;
import jakarta.validation.constraints.NotNull;

public class ReviewNominationRequest {

    @NotNull(message = "Decision status is required (APPROVED or REJECTED)")
    private NominationStatus decision;

    private String rejectionReason;

    public ReviewNominationRequest() {}

    public NominationStatus getDecision() {
        return decision;
    }

    public void setDecision(NominationStatus decision) {
        this.decision = decision;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
