package com.awardhub.awardhub.user.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Judge subtype — users assigned to evaluate nominations against rubric criteria.
 */
@Entity
@Table(name = "judges")
@DiscriminatorValue("JUDGE")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Judge extends User {

    private String areaOfExpertise;
}
