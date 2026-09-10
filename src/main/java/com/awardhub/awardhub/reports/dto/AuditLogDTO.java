package com.awardhub.awardhub.reports.dto;

public class AuditLogDTO {
    private Long logID;
    private Long performedByUserId;
    private String userEmail;
    private String actionType;
    private String entityType;
    private Long entityId;
    private String details;
    private String timestamp;

    public AuditLogDTO() {}

    public AuditLogDTO(Long logID, Long performedByUserId, String userEmail, String actionType, String entityType,
                       Long entityId, String details, String timestamp) {
        this.logID = logID;
        this.performedByUserId = performedByUserId;
        this.userEmail = userEmail;
        this.actionType = actionType;
        this.entityType = entityType;
        this.entityId = entityId;
        this.details = details;
        this.timestamp = timestamp;
    }

    public Long getLogID() { return logID; }
    public void setLogID(Long logID) { this.logID = logID; }

    public Long getPerformedByUserId() { return performedByUserId; }
    public void setPerformedByUserId(Long performedByUserId) { this.performedByUserId = performedByUserId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
