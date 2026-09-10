package com.awardhub.awardhub.user.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Voter subtype — users who register to cast votes on nominees.
 * NIC is used for duplicate-prevention (one person = one voter account).
 */
@Entity
@Table(name = "voters")
@DiscriminatorValue("VOTER")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Voter extends User {

    @Column(unique = true)
    private String nic;

    @Column(nullable = false)
    private Boolean activationStatus = false;
}
