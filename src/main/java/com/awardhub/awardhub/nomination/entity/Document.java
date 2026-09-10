package com.awardhub.awardhub.nomination.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Document weak entity identifying key = nominationID + documentType.
 * Represents evidence uploaded in support of a nomination.
 */
@Entity
@Table(name = "nomination_documents", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"nomination_id", "document_type"})
})
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nomination_id", nullable = false)
    private Nomination nomination;

    @Column(name = "document_type", nullable = false, length = 60)
    private String documentType;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_format", length = 30)
    private String fileFormat;

    @Column(name = "file_size")
    private Long size;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "upload_date", nullable = false)
    private LocalDateTime uploadDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 30)
    private DocumentVerificationStatus verificationStatus = DocumentVerificationStatus.PENDING;

    public Document() {}

    @PrePersist
    protected void onCreate() {
        this.uploadDate = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public Nomination getNomination() {
        return nomination;
    }

    public void setNomination(Nomination nomination) {
        this.nomination = nomination;
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
