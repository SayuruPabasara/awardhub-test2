package com.awardhub.awardhub.nomination.service;

import com.awardhub.awardhub.category.entity.AwardCategory;
import com.awardhub.awardhub.category.entity.CategoryStatus;
import com.awardhub.awardhub.category.repository.AwardCategoryRepository;
import com.awardhub.awardhub.common.audit.AuditLogService;
import com.awardhub.awardhub.common.exception.BadRequestException;
import com.awardhub.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.awardhub.nomination.dto.DocumentResponse;
import com.awardhub.awardhub.nomination.dto.NominationRequest;
import com.awardhub.awardhub.nomination.dto.NominationResponse;
import com.awardhub.awardhub.nomination.dto.ReviewNominationRequest;
import com.awardhub.awardhub.nomination.entity.Document;
import com.awardhub.awardhub.nomination.entity.DocumentVerificationStatus;
import com.awardhub.awardhub.nomination.entity.Nomination;
import com.awardhub.awardhub.nomination.entity.NominationStatus;
import com.awardhub.awardhub.nomination.repository.DocumentRepository;
import com.awardhub.awardhub.nomination.repository.NominationRepository;
import com.awardhub.awardhub.user.entity.Nominee;
import com.awardhub.awardhub.user.entity.User;
import com.awardhub.awardhub.user.repository.NomineeRepository;
import com.awardhub.awardhub.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NominationService {

    private final NominationRepository nominationRepository;
    private final DocumentRepository documentRepository;
    private final AwardCategoryRepository categoryRepository;
    private final NomineeRepository nomineeRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    private static final String UPLOAD_DIR = "uploads/nominations";

    public NominationService(
            NominationRepository nominationRepository,
            DocumentRepository documentRepository,
            AwardCategoryRepository categoryRepository,
            NomineeRepository nomineeRepository,
            UserRepository userRepository,
            AuditLogService auditLogService
    ) {
        this.nominationRepository = nominationRepository;
        this.documentRepository = documentRepository;
        this.categoryRepository = categoryRepository;
        this.nomineeRepository = nomineeRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<NominationResponse> getAllNominations(NominationStatus status) {
        List<Nomination> list;
        if (status != null) {
            list = nominationRepository.findByStatus(status);
        } else {
            list = nominationRepository.findAll();
        }
        return list.stream().map(NominationResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NominationResponse> getNominationsByNominee(Long nomineeUserId) {
        return nominationRepository.findByNomineeId(nomineeUserId)
                .stream().map(NominationResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NominationResponse> getNominationsByCategory(Long categoryId) {
        return nominationRepository.findByCategoryId(categoryId)
                .stream().map(NominationResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NominationResponse> getApprovedNominationsForCategory(Long categoryId) {
        return nominationRepository.findApprovedByCategoryId(categoryId)
                .stream().map(NominationResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NominationResponse getNominationById(Long id) {
        Nomination nomination = nominationRepository.findByIdWithDocuments(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nomination not found with id: " + id));
        return NominationResponse.fromEntity(nomination);
    }

    @Transactional
    public NominationResponse createNomination(NominationRequest req, Long nomineeUserId) {
        Nominee nominee = nomineeRepository.findById(nomineeUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Nominee profile not found for user id: " + nomineeUserId));

        AwardCategory category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Award category not found with id: " + req.getCategoryId()));

        // Verify category is open for nominations
        validateCategoryOpenForNomination(category);

        Nomination nom = new Nomination();
        nom.setNominee(nominee);
        nom.setCategory(category);
        nom.setTitle(req.getTitle());
        nom.setAchievementDescription(req.getAchievementDescription());
        nom.setEvidenceDetails(req.getEvidenceDetails());
        nom.setDeclaration(req.getDeclaration());

        if (req.isSubmitImmediately()) {
            nom.setStatus(NominationStatus.SUBMITTED);
            nom.setSubmissionDate(LocalDateTime.now());
        } else {
            nom.setStatus(NominationStatus.DRAFT);
        }

        Nomination saved = nominationRepository.save(nom);
        auditLogService.log(
                nomineeUserId,
                "CREATE_NOMINATION",
                "Nomination",
                saved.getNominationId(),
                "Created nomination: " + saved.getTitle() + " for category: " + category.getCategoryName()
        );
        return NominationResponse.fromEntity(saved);
    }

    @Transactional
    public NominationResponse updateNomination(Long id, NominationRequest req, Long nomineeUserId) {
        Nomination nom = nominationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nomination not found with id: " + id));

        if (!nom.getNominee().getUserID().equals(nomineeUserId)) {
            throw new BadRequestException("You can only edit your own nominations");
        }

        if (nom.getStatus() == NominationStatus.APPROVED || nom.getStatus() == NominationStatus.REJECTED) {
            throw new BadRequestException("Cannot edit a nomination that has already been reviewed (" + nom.getStatus() + ")");
        }

        nom.setTitle(req.getTitle());
        nom.setAchievementDescription(req.getAchievementDescription());
        nom.setEvidenceDetails(req.getEvidenceDetails());
        nom.setDeclaration(req.getDeclaration());

        if (req.isSubmitImmediately() && nom.getStatus() == NominationStatus.DRAFT) {
            nom.setStatus(NominationStatus.SUBMITTED);
            nom.setSubmissionDate(LocalDateTime.now());
        }

        Nomination updated = nominationRepository.save(nom);
        auditLogService.log(
                nomineeUserId,
                "UPDATE_NOMINATION",
                "Nomination",
                updated.getNominationId(),
                "Updated nomination: " + updated.getTitle()
        );
        return NominationResponse.fromEntity(updated);
    }

    @Transactional
    public NominationResponse submitNomination(Long id, Long nomineeUserId) {
        Nomination nom = nominationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nomination not found with id: " + id));

        if (!nom.getNominee().getUserID().equals(nomineeUserId)) {
            throw new BadRequestException("You can only submit your own nomination");
        }

        validateCategoryOpenForNomination(nom.getCategory());

        // Check required documents
        List<String> requiredDocs = nom.getCategory().getRequiredDocumentTypes();
        if (requiredDocs != null && !requiredDocs.isEmpty()) {
            List<String> uploadedTypes = nom.getDocuments().stream()
                    .map(Document::getDocumentType)
                    .collect(Collectors.toList());
            for (String reqType : requiredDocs) {
                if (!uploadedTypes.contains(reqType)) {
                    throw new BadRequestException("Missing mandatory document: " + reqType);
                }
            }
        }

        nom.setStatus(NominationStatus.SUBMITTED);
        nom.setSubmissionDate(LocalDateTime.now());
        Nomination saved = nominationRepository.save(nom);

        auditLogService.log(
                nomineeUserId,
                "SUBMIT_NOMINATION",
                "Nomination",
                saved.getNominationId(),
                "Submitted nomination: " + saved.getTitle()
        );
        return NominationResponse.fromEntity(saved);
    }

    @Transactional
    public NominationResponse withdrawNomination(Long id, Long nomineeUserId) {
        Nomination nom = nominationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nomination not found with id: " + id));

        if (!nom.getNominee().getUserID().equals(nomineeUserId)) {
            throw new BadRequestException("You can only withdraw your own nomination");
        }

        if (nom.getStatus() == NominationStatus.APPROVED) {
            throw new BadRequestException("Approved nominations cannot be withdrawn. Please contact organizers.");
        }

        nom.setStatus(NominationStatus.WITHDRAWN);
        Nomination saved = nominationRepository.save(nom);

        auditLogService.log(
                nomineeUserId,
                "WITHDRAW_NOMINATION",
                "Nomination",
                saved.getNominationId(),
                "Withdrew nomination: " + saved.getTitle()
        );
        return NominationResponse.fromEntity(saved);
    }

    @Transactional
    public NominationResponse reviewNomination(Long id, ReviewNominationRequest req, Long reviewerUserId) {
        Nomination nom = nominationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nomination not found with id: " + id));

        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer user not found with id: " + reviewerUserId));

        if (req.getDecision() != NominationStatus.APPROVED && req.getDecision() != NominationStatus.REJECTED) {
            throw new BadRequestException("Decision must be either APPROVED or REJECTED");
        }

        if (req.getDecision() == NominationStatus.REJECTED && (req.getRejectionReason() == null || req.getRejectionReason().isBlank())) {
            throw new BadRequestException("Rejection reason is required when rejecting a nomination");
        }

        nom.setStatus(req.getDecision());
        nom.setReviewDate(LocalDateTime.now());
        nom.setReviewedBy(reviewer);
        nom.setRejectionReason(req.getRejectionReason());

        Nomination reviewed = nominationRepository.save(nom);
        auditLogService.log(
                reviewerUserId,
                "REVIEW_NOMINATION",
                "Nomination",
                reviewed.getNominationId(),
                "Reviewed nomination: " + reviewed.getTitle() + " -> " + req.getDecision()
        );
        return NominationResponse.fromEntity(reviewed);
    }

    @Transactional
    public DocumentResponse uploadDocument(Long nominationId, String documentType, MultipartFile file, Long userId) {
        Nomination nom = nominationRepository.findById(nominationId)
                .orElseThrow(() -> new ResourceNotFoundException("Nomination not found with id: " + nominationId));

        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR, nominationId.toString());
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String safeFileName = UUID.randomUUID() + extension;
            Path targetLocation = uploadPath.resolve(safeFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Check if document of this type already exists for this nomination
            Document doc = documentRepository.findByNominationNominationIdAndDocumentType(nominationId, documentType)
                    .orElseGet(Document::new);

            doc.setNomination(nom);
            doc.setDocumentType(documentType);
            doc.setFileName(originalFilename != null ? originalFilename : safeFileName);
            doc.setFileFormat(file.getContentType());
            doc.setSize(file.getSize());
            doc.setFilePath(targetLocation.toString());
            doc.setVerificationStatus(DocumentVerificationStatus.VERIFIED); // Default verified upon upload in dev

            Document saved = documentRepository.save(doc);
            auditLogService.log(
                    userId,
                    "UPLOAD_DOCUMENT",
                    "Document",
                    saved.getDocumentId(),
                    "Uploaded document " + documentType + " for nomination " + nominationId
            );
            return DocumentResponse.fromEntity(saved);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteDocument(Long documentId, Long userId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        Long nominationId = doc.getNomination().getNominationId();
        documentRepository.delete(doc);

        auditLogService.log(
                userId,
                "DELETE_DOCUMENT",
                "Document",
                documentId,
                "Deleted document " + doc.getDocumentType() + " from nomination " + nominationId
        );
    }

    private void validateCategoryOpenForNomination(AwardCategory category) {
        if (category.getStatus() != CategoryStatus.NOMINATIONS_OPEN) {
            throw new BadRequestException("Category " + category.getCategoryName() + " is not currently open for nominations (Status: " + category.getStatus() + ")");
        }
        if (category.getNominationDeadline() != null && category.getNominationDeadline().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("The nomination deadline for " + category.getCategoryName() + " has passed (" + category.getNominationDeadline() + ")");
        }
    }
}
