package com.awardhub.awardhub.common.audit;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * AuditLog — tracks all approval, vote, evaluation, and publication actions.
 */
@Entity
@Table(name = "audit_logs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logID;

    private Long performedByUserId;

    @Column(nullable = false)
    private String actionType;

    @Column(columnDefinition = "TEXT")
    private String details;

    private String entityType;
    private Long entityId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
