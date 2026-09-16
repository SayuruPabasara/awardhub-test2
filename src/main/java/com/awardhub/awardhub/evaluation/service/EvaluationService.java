package com.awardhub.awardhub.evaluation.service;

import com.awardhub.awardhub.category.entity.AwardCategory;
import com.awardhub.awardhub.category.entity.RubricCriterion;
import com.awardhub.awardhub.category.repository.AwardCategoryRepository;
import com.awardhub.awardhub.common.audit.AuditLogService;
import com.awardhub.awardhub.common.exception.BadRequestException;
import com.awardhub.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.awardhub.evaluation.dto.EvaluationRequest;
import com.awardhub.awardhub.evaluation.dto.EvaluationResponse;
import com.awardhub.awardhub.evaluation.entity.Evaluation;
import com.awardhub.awardhub.evaluation.repository.EvaluationRepository;
import com.awardhub.awardhub.nomination.dto.EvaluationAssignmentRequest;
import com.awardhub.awardhub.nomination.entity.Nomination;
import com.awardhub.awardhub.nomination.repository.NominationRepository;
import com.awardhub.awardhub.user.entity.Judge;
import com.awardhub.awardhub.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;
    private final NominationRepository nominationRepository;
    private final AwardCategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public EvaluationService(EvaluationRepository evaluationRepository, UserRepository userRepository,
                             NominationRepository nominationRepository, AwardCategoryRepository categoryRepository,
                             AuditLogService auditLogService) {
        this.evaluationRepository = evaluationRepository;
        this.userRepository = userRepository;
        this.nominationRepository = nominationRepository;
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> getMyAssignments(Long judgeId) {
        List<Evaluation> evaluations = evaluationRepository.findByJudgeId(judgeId);
        return evaluations.stream().map(EvaluationResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> getPendingAssignments(Long judgeId) {
        List<Evaluation> evaluations = evaluationRepository.findPendingByJudgeId(judgeId);
        return evaluations.stream().map(EvaluationResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> getAllEvaluations(Long categoryId, Long nominationId, String status) {
        List<Evaluation> list = evaluationRepository.findAll();
        return list.stream()
                .filter(e -> categoryId == null || (e.getCategory() != null && e.getCategory().getCategoryId().equals(categoryId)))
                .filter(e -> nominationId == null || (e.getNomination() != null && e.getNomination().getNominationId().equals(nominationId)))
                .filter(e -> status == null || status.isBlank() || e.getStatus().equalsIgnoreCase(status))
                .map(EvaluationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> getEvaluationsByCategory(Long categoryId) {
        return evaluationRepository.findByCategoryCategoryId(categoryId).stream()
                .map(EvaluationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> getEvaluationsByNomination(Long nominationId) {
        return evaluationRepository.findByNominationId(nominationId).stream()
                .map(EvaluationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<EvaluationResponse> assignJudgesToNomination(EvaluationAssignmentRequest request, Long organizerUserId) {
        if (request.getNominationId() == null) {
            throw new BadRequestException("Nomination ID is required");
        }
        if (request.getJudgeIds() == null || request.getJudgeIds().isEmpty()) {
            throw new BadRequestException("At least one judge ID is required");
        }

        Nomination nomination = nominationRepository.findById(request.getNominationId())
                .orElseThrow(() -> new ResourceNotFoundException("Nomination not found with id: " + request.getNominationId()));

        List<Evaluation> existingEvaluations = evaluationRepository.findByNominationId(request.getNominationId());
        List<EvaluationResponse> assigned = new ArrayList<>();

        for (Long judgeId : request.getJudgeIds()) {
            boolean alreadyAssigned = existingEvaluations.stream()
                    .anyMatch(e -> e.getJudge().getUserID().equals(judgeId));
            if (alreadyAssigned) {
                continue;
            }

            var user = userRepository.findById(judgeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Judge not found with id: " + judgeId));
            if (!(user instanceof Judge)) {
                throw new BadRequestException("User with id " + judgeId + " is not a Judge");
            }

            Evaluation eval = new Evaluation();
            eval.setNomination(nomination);
            eval.setJudge((Judge) user);
            eval.setCategory(nomination.getCategory());
            eval.setStatus("PENDING");
            eval.setCriterionScores("{}");
            eval.setSubmissionDate(LocalDateTime.now());

            Evaluation saved = evaluationRepository.save(eval);
            assigned.add(EvaluationResponse.fromEntity(saved));
        }

        auditLogService.log(organizerUserId, "ASSIGN_JUDGES", "Nomination", nomination.getNominationId(),
                "Assigned " + assigned.size() + " judges to nomination: " + nomination.getTitle());

        return assigned;
    }

    @Transactional
    public void unassignJudge(Long evaluationId, Long organizerUserId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found with id: " + evaluationId));

        if ("COMPLETED".equals(evaluation.getStatus())) {
            throw new BadRequestException("Cannot unassign a completed evaluation");
        }

        evaluationRepository.delete(evaluation);
        auditLogService.log(organizerUserId, "UNASSIGN_JUDGE", "Evaluation", evaluationId,
                "Unassigned judge from nomination: " + evaluation.getNomination().getNominationId());
    }

    @Transactional
    public EvaluationResponse submitEvaluation(Long evaluationId, Long judgeId, EvaluationRequest request) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found"));

        if (!evaluation.getJudge().getUserID().equals(judgeId)) {
            throw new BadRequestException("You are not authorized to submit this evaluation");
        }

        if ("COMPLETED".equals(evaluation.getStatus())) {
            throw new BadRequestException("This evaluation has already been submitted");
        }

        // Calculate total weighted score against category rubric
        double totalScore = calculateWeightedScore(request.getScores(), evaluation.getCategory());

        evaluation.setStatus("COMPLETED");
        evaluation.setTotalScore(totalScore);
        evaluation.setComments(request.getComments());

        // Serialize scores to JSON string
        String criterionScoresJson = serializeScores(request.getScores());
        evaluation.setCriterionScores(criterionScoresJson);

        Evaluation saved = evaluationRepository.save(evaluation);
        auditLogService.log(judgeId, "EVALUATION_SUBMITTED", "Evaluation", saved.getEvaluationId(),
                "Judge submitted evaluation for nomination: " + evaluation.getNomination().getNominationId());

        return EvaluationResponse.fromEntity(saved);
    }

    private double calculateWeightedScore(Map<String, Integer> scores, AwardCategory category) {
        if (scores == null || scores.isEmpty()) {
            return 0.0;
        }

        List<RubricCriterion> rubric = (category != null && category.getRubricCriteria() != null && !category.getRubricCriteria().isEmpty())
                ? category.getRubricCriteria()
                : AwardCategory.getDefaultRubric();

        double totalWeighted = 0.0;
        double totalWeight = 0.0;

        for (RubricCriterion criterion : rubric) {
            Integer score = scores.get(criterion.getKey());
            if (score != null) {
                totalWeighted += score * (criterion.getWeight() / 100.0);
                totalWeight += (criterion.getWeight() / 100.0);
            }
        }

        if (totalWeight > 0) {
            return Math.round((totalWeighted / totalWeight) * 100.0) / 100.0;
        }

        // Fallback to simple average
        return scores.values().stream().mapToDouble(Double::valueOf).average().orElse(0.0);
    }

    private String serializeScores(Map<String, Integer> scores) {
        if (scores == null || scores.isEmpty()) {
            return "{}";
        }

        StringBuilder json = new StringBuilder("{");
        scores.forEach((key, value) -> {
            if (json.length() > 1) {
                json.append(",");
            }
            json.append("\"").append(key).append("\":").append(value);
        });
        json.append("}");
        return json.toString();
    }
}
