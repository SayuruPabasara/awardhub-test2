package com.awardhub.awardhub.evaluation.service;

import com.awardhub.awardhub.category.repository.AwardCategoryRepository;
import com.awardhub.awardhub.common.audit.AuditLogService;
import com.awardhub.awardhub.common.exception.BadRequestException;
import com.awardhub.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.awardhub.evaluation.dto.EvaluationRequest;
import com.awardhub.awardhub.evaluation.dto.EvaluationResponse;
import com.awardhub.awardhub.evaluation.entity.Evaluation;
import com.awardhub.awardhub.evaluation.repository.EvaluationRepository;
import com.awardhub.awardhub.nomination.repository.NominationRepository;
import com.awardhub.awardhub.user.entity.Judge;
import com.awardhub.awardhub.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        // Calculate total weighted score
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

    private double calculateWeightedScore(Map<String, Integer> scores, Object category) {
        if (scores == null || scores.isEmpty()) {
            return 0.0;
        }

        // For now, simple average; in production you'd weight by rubric
        double sum = scores.values().stream().mapToDouble(Double::valueOf).sum();
        return sum / scores.size();
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
