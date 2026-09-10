package com.awardhub.awardhub.nomination.dto;

import com.awardhub.awardhub.nomination.entity.Document;
import com.awardhub.awardhub.nomination.entity.DocumentVerificationStatus;
import java.time.LocalDateTime;

public class DocumentResponse {

    private Long documentId;
    private String documentType;
    private String fileName;
    private String fileFormat;
    private Long size;
    private String filePath;
    private LocalDateTime uploadDate;
    private DocumentVerificationStatus verificationStatus;

    public DocumentResponse() {}

    public static DocumentResponse fromEntity(Document doc) {
        DocumentResponse dto = new DocumentResponse();
        dto.setDocumentId(doc.getDocumentId());
        dto.setDocumentType(doc.getDocumentType());
        dto.setFileName(doc.getFileName());
        dto.setFileFormat(doc.getFileFormat());
        dto.setSize(doc.getSize());
        dto.setFilePath(doc.getFilePath());
        dto.setUploadDate(doc.getUploadDate());
        dto.setVerificationStatus(doc.getVerificationStatus());
        return dto;
    }

    // Getters and Setters

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileFormat() {
        return fileFormat;
    }

    public void setFileFormat(String fileFormat) {
        this.fileFormat = fileFormat;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public DocumentVerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(DocumentVerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }
}
