package com.awardhub.awardhub.user.entity;

/**
 * Defines the disjoint, total specialization roles for User accounts.
 * Every User must have exactly one role — no roleless accounts, no multi-role.
 */
public enum UserRole {
    NOMINEE,
    VOTER,
    JUDGE,
    AWARD_ORGANIZER,
    SYSTEM_ADMINISTRATOR
}
