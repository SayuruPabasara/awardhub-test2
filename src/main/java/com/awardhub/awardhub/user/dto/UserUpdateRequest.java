package com.awardhub.awardhub.user.dto;

public class UserUpdateRequest {
    private String contactNumber;
    private String accountStatus;

    public UserUpdateRequest() {}

    public UserUpdateRequest(String contactNumber, String accountStatus) {
        this.contactNumber = contactNumber;
        this.accountStatus = accountStatus;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }
}
