package com.awardhub.awardhub.category.entity;

/**
 * Method used to determine the winner for an award category.
 * - VOTING_ONLY: Winner determined solely by public vote count.
 * - JUDGING_ONLY: Winner determined solely by judge evaluation scores.
 * - HYBRID: Configurable weighted combination of voting score and judge score.
 */
public enum EvaluationMethod {
    VOTING_ONLY,
    JUDGING_ONLY,
    HYBRID
}
