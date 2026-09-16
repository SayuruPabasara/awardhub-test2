package com.awardhub.awardhub.category.service;

import com.awardhub.awardhub.category.dto.CategoryResponse;
import com.awardhub.awardhub.category.dto.CreateCategoryRequest;
import com.awardhub.awardhub.category.dto.UpdateCategoryRequest;
import com.awardhub.awardhub.category.entity.AwardCategory;
import com.awardhub.awardhub.category.entity.CategoryStatus;
import com.awardhub.awardhub.category.entity.EvaluationMethod;
import com.awardhub.awardhub.category.repository.AwardCategoryRepository;
import com.awardhub.awardhub.common.audit.AuditLogService;
import com.awardhub.awardhub.common.exception.BadRequestException;
import com.awardhub.awardhub.common.exception.DuplicateResourceException;
import com.awardhub.awardhub.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AwardCategoryService {

    private final AwardCategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public AwardCategoryService(AwardCategoryRepository categoryRepository, AuditLogService auditLogService) {
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(CategoryStatus status) {
        List<AwardCategory> list;
        if (status != null) {
            list = categoryRepository.findByStatus(status);
        } else {
            list = categoryRepository.findAll();
        }
        return list.stream().map(CategoryResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        AwardCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Award Category not found with id: " + id));
        return CategoryResponse.fromEntity(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesOpenForNomination() {
        return categoryRepository.findOpenForNomination(LocalDateTime.now())
                .stream().map(CategoryResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesOpenForVoting() {
        return categoryRepository.findOpenForVoting(LocalDateTime.now())
                .stream().map(CategoryResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest req, Long userId) {
        if (categoryRepository.existsByCategoryName(req.getCategoryName())) {
            throw new DuplicateResourceException("Category already exists with name: " + req.getCategoryName());
        }

        validateCategoryDatesAndWeights(
                req.getNominationDeadline(),
                req.getVotingStartDate(),
                req.getVotingEndDate(),
                req.getEvaluationMethod(),
                req.getVotingWeightage(),
                req.getJudgingWeightage()
        );

        AwardCategory cat = new AwardCategory();
        cat.setCategoryName(req.getCategoryName());
        cat.setDescription(req.getDescription());
        cat.setEligibilityCriteria(req.getEligibilityCriteria());
        cat.setNominationDeadline(req.getNominationDeadline());
        cat.setVotingStartDate(req.getVotingStartDate());
        cat.setVotingEndDate(req.getVotingEndDate());
        cat.setEvaluationMethod(req.getEvaluationMethod());
        cat.setVotingWeightage(req.getVotingWeightage() != null ? req.getVotingWeightage() : 50.0);
        cat.setJudgingWeightage(req.getJudgingWeightage() != null ? req.getJudgingWeightage() : 50.0);
        cat.setMaxVotesPerVoter(req.getMaxVotesPerVoter() != null ? req.getMaxVotesPerVoter() : 1);
        cat.setStatus(req.getStatus() != null ? req.getStatus() : CategoryStatus.DRAFT);
        if (req.getRequiredDocumentTypes() != null) {
            cat.setRequiredDocumentTypes(req.getRequiredDocumentTypes());
        }
        if (req.getRubricCriteria() != null && !req.getRubricCriteria().isEmpty()) {
            cat.setRubricCriteria(new java.util.ArrayList<>(req.getRubricCriteria()));
        } else {
            cat.setRubricCriteria(new java.util.ArrayList<>(AwardCategory.getDefaultRubric()));
        }

        AwardCategory saved = categoryRepository.save(cat);
        auditLogService.log(userId, "CREATE_CATEGORY", "AwardCategory", saved.getCategoryId(), "Created category: " + saved.getCategoryName());
        return CategoryResponse.fromEntity(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest req, Long userId) {
        AwardCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Award Category not found with id: " + id));

        if (req.getCategoryName() != null && !req.getCategoryName().equalsIgnoreCase(cat.getCategoryName())) {
            if (categoryRepository.existsByCategoryName(req.getCategoryName())) {
                throw new DuplicateResourceException("Category already exists with name: " + req.getCategoryName());
            }
            cat.setCategoryName(req.getCategoryName());
        }

        if (req.getDescription() != null) cat.setDescription(req.getDescription());
        if (req.getEligibilityCriteria() != null) cat.setEligibilityCriteria(req.getEligibilityCriteria());
        if (req.getNominationDeadline() != null) cat.setNominationDeadline(req.getNominationDeadline());
        if (req.getVotingStartDate() != null) cat.setVotingStartDate(req.getVotingStartDate());
        if (req.getVotingEndDate() != null) cat.setVotingEndDate(req.getVotingEndDate());
        if (req.getEvaluationMethod() != null) cat.setEvaluationMethod(req.getEvaluationMethod());
        if (req.getVotingWeightage() != null) cat.setVotingWeightage(req.getVotingWeightage());
        if (req.getJudgingWeightage() != null) cat.setJudgingWeightage(req.getJudgingWeightage());
        if (req.getMaxVotesPerVoter() != null) cat.setMaxVotesPerVoter(req.getMaxVotesPerVoter());
        if (req.getStatus() != null) cat.setStatus(req.getStatus());
        if (req.getRequiredDocumentTypes() != null) cat.setRequiredDocumentTypes(req.getRequiredDocumentTypes());
        if (req.getRubricCriteria() != null) cat.setRubricCriteria(new java.util.ArrayList<>(req.getRubricCriteria()));

        validateCategoryDatesAndWeights(
                cat.getNominationDeadline(),
                cat.getVotingStartDate(),
                cat.getVotingEndDate(),
                cat.getEvaluationMethod(),
                cat.getVotingWeightage(),
                cat.getJudgingWeightage()
        );

        AwardCategory updated = categoryRepository.save(cat);
        auditLogService.log(userId, "UPDATE_CATEGORY", "AwardCategory", updated.getCategoryId(), "Updated category: " + updated.getCategoryName());
        return CategoryResponse.fromEntity(updated);
    }

    @Transactional
    public CategoryResponse updateCategoryStatus(Long id, CategoryStatus newStatus, Long userId) {
        AwardCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Award Category not found with id: " + id));

        CategoryStatus oldStatus = cat.getStatus();
        cat.setStatus(newStatus);
        AwardCategory updated = categoryRepository.save(cat);

        auditLogService.log(userId, "CATEGORY_STATUS_CHANGE", "AwardCategory", updated.getCategoryId(), "Changed category " + cat.getCategoryName() + " status from " + oldStatus + " to " + newStatus);
        return CategoryResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteCategory(Long id, Long userId) {
        AwardCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Award Category not found with id: " + id));

        categoryRepository.delete(cat);
        auditLogService.log(userId, "DELETE_CATEGORY", "AwardCategory", id, "Deleted category: " + cat.getCategoryName());
    }

    private void validateCategoryDatesAndWeights(
            LocalDateTime nominationDeadline,
            LocalDateTime votingStart,
            LocalDateTime votingEnd,
            EvaluationMethod method,
            Double votingWeight,
            Double judgingWeight
    ) {
        if (votingStart != null && votingEnd != null && votingStart.isAfter(votingEnd)) {
            throw new BadRequestException("Voting start date must be before voting end date");
        }

        if (nominationDeadline != null && votingStart != null && nominationDeadline.isAfter(votingStart)) {
            throw new BadRequestException("Nomination deadline must be before or equal to voting start date");
        }

        if (method == EvaluationMethod.HYBRID) {
            double vWeight = votingWeight != null ? votingWeight : 0.0;
            double jWeight = judgingWeight != null ? judgingWeight : 0.0;
            if (Math.abs((vWeight + jWeight) - 100.0) > 0.001) {
                throw new BadRequestException("For HYBRID evaluation, voting weightage (" + vWeight + "%) and judging weightage (" + jWeight + "%) must sum to 100%");
            }
        }
    }
}
