package com.awardhub.awardhub.user.dto;

import com.awardhub.awardhub.user.entity.AccountStatus;
import com.awardhub.awardhub.user.entity.UserRole;

public class UserDTO {
    private Long userID;
    private String email;
    private String contactNumber;
    private UserRole role;
    private AccountStatus accountStatus;

    public UserDTO() {}

    public UserDTO(Long userID, String email, String contactNumber, UserRole role, AccountStatus accountStatus) {
        this.userID = userID;
        this.email = email;
        this.contactNumber = contactNumber;
        this.role = role;
        this.accountStatus = accountStatus;
    }

    public Long getUserID() {
        return userID;
    }

    public void setUserID(Long userID) {
        this.userID = userID;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(AccountStatus accountStatus) {
        this.accountStatus = accountStatus;
    }
}
