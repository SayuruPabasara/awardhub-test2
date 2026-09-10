package com.awardhub.awardhub.category.entity;

/**
 * Lifecycle status of an award category.
 */
public enum CategoryStatus {
    DRAFT,
    UPCOMING,
    NOMINATIONS_OPEN,
    NOMINATIONS_CLOSED,
    VOTING_OPEN,
    VOTING_CLOSED,
    UNDER_EVALUATION,
    RESULTS_READY,
    PUBLISHED,
    ARCHIVED
}
