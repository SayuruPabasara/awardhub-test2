package com.awardhub.awardhub.security.dto;

import com.awardhub.awardhub.user.entity.UserRole;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotNull(message = "Role is required")
    private UserRole role;

    private String contactNumber;

    // Role-specific fields (nullable — only relevant for certain roles)
    private String nicPassport;   // Nominee
    private String nic;           // Voter
    private String areaOfExpertise; // Judge
    private String position;      // AwardOrganizer
    private String accessLevel;   // SystemAdministrator
}
