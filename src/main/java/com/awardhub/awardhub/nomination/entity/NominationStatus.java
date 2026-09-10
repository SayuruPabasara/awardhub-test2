package com.awardhub.awardhub.nomination.entity;

/**
 * Lifecycle status of a nomination.
 * DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED / REJECTED / WITHDRAWN
 */
public enum NominationStatus {
    DRAFT,
    SUBMITTED,
    UNDER_REVIEW,
    APPROVED,
    REJECTED,
    WITHDRAWN
}
