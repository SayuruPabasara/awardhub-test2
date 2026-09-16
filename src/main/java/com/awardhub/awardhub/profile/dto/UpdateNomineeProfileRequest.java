package com.awardhub.awardhub.profile.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateNomineeProfileRequest {

    @Pattern(regexp = "^[+]?[0-9 \\-]{7,15}$", message = "Enter a valid contact number")
    private String contactNumber;

    @Pattern(regexp = "^([0-9]{9}[vVxX]|[0-9]{12}|[A-Za-z][0-9]{7,9})$",
             message = "Enter a valid NIC or passport number")
    private String nicPassport;

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Date of birth must be a valid date")
    private String dateOfBirth;

    @Pattern(regexp = "^(Male|Female|Other|Prefer not to say)$", message = "Select a valid gender option")
    private String gender;

    @Size(max = 150, message = "Street address is too long")
    private String street;

    @Size(max = 100, message = "City is too long")
    private String city;

    @Size(max = 100, message = "State/Province is too long")
    private String state;

    @Pattern(regexp = "^[0-9A-Za-z \\-]{3,10}$", message = "Enter a valid postal/zip code")
    private String zip;

    @Size(max = 150, message = "Organization name is too long")
    private String organization;

    @Size(max = 150, message = "Job title is too long")
    private String jobTitle;

    @Size(max = 5000, message = "Biography is too long")
    private String biography;

    @Size(max = 5000, message = "Education is too long")
    private String education;

    @Size(max = 5000, message = "Achievements is too long")
    private String achievements;

    @Size(max = 5000, message = "References is too long")
    private String references;

    public UpdateNomineeProfileRequest() {}

    // Getters and Setters

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getNicPassport() {
        return nicPassport;
    }

    public void setNicPassport(String nicPassport) {
        this.nicPassport = nicPassport;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZip() {
        return zip;
    }

    public void setZip(String zip) {
        this.zip = zip;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getBiography() {
        return biography;
    }

    public void setBiography(String biography) {
        this.biography = biography;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getAchievements() {
        return achievements;
    }

    public void setAchievements(String achievements) {
        this.achievements = achievements;
    }

    public String getReferences() {
        return references;
    }

    public void setReferences(String references) {
        this.references = references;
    }
}