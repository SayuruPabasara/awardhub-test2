package com.awardhub.awardhub.user.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * AwardOrganizer subtype — manages categories, reviews nominations,
 * assigns judges, monitors voting, publishes results, generates reports.
 */
@Entity
@Table(name = "award_organizers")
@DiscriminatorValue("AWARD_ORGANIZER")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class AwardOrganizer extends User {

    private String position;
}
