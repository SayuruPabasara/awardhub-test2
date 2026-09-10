package com.awardhub.awardhub.user.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Superclass entity in the User ISA hierarchy.
 * Uses JOINED inheritance — each subtype gets its own table with FK back to users.
 */
@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userID;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String contactNumber;

    @Column(nullable = false, updatable = false)
    private LocalDateTime registrationDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountStatus accountStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", insertable = false, updatable = false)
    private UserRole role;

    @PrePersist
    protected void onCreate() {
        this.registrationDate = LocalDateTime.now();
        if (this.accountStatus == null) {
            this.accountStatus = AccountStatus.PENDING_VERIFICATION;
        }
    }
}
