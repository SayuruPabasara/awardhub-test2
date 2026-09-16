package com.awardhub.awardhub.security.dto;

import com.awardhub.awardhub.user.entity.UserRole;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Pattern(
        regexp = "^[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\\.[A-Za-z]{2,}$",
        message = "Enter a valid email address (e.g. name@example.com)"
    )
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotNull(message = "Role is required")
    private UserRole role;

    private String contactNumber;

    // Role-specific fields (nullable — only relevant for certain roles)
    @Pattern(regexp = "^([0-9]{9}[vVxX]|[0-9]{12}|[A-Za-z][0-9]{7,9})$",
             message = "Enter a valid NIC or passport number")
    private String nicPassport;   // Nominee

    @Pattern(regexp = "^([0-9]{9}[vVxX]|[0-9]{12})$",
             message = "Enter a valid NIC number")
    private String nic;           // Voter

    private String areaOfExpertise; // Judge
    private String position;      // AwardOrganizer
    private String accessLevel;   // SystemAdministrator
}