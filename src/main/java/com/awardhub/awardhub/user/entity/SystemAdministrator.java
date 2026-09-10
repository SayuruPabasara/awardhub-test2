package com.awardhub.awardhub.user.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * SystemAdministrator subtype — manages accounts/roles, security,
 * audit logs, backups, and system availability.
 */
@Entity
@Table(name = "system_administrators")
@DiscriminatorValue("SYSTEM_ADMINISTRATOR")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class SystemAdministrator extends User {

    private String accessLevel;
}
