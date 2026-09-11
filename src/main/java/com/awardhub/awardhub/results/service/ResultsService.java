package com.awardhub.awardhub.results.service;

import com.awardhub.awardhub.category.entity.AwardCategory;
import com.awardhub.awardhub.category.entity.EvaluationMethod;
import com.awardhub.awardhub.category.repository.AwardCategoryRepository;
import com.awardhub.awardhub.common.audit.AuditLogService;
import com.awardhub.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.awardhub.evaluation.repository.EvaluationRepository;
import com.awardhub.awardhub.results.dto.FinalScoreResponse;
import com.awardhub.awardhub.results.entity.FinalScore;
import com.awardhub.awardhub.results.repository.FinalScoreRepository;
import com.awardhub.awardhub.user.entity.Nominee;
import com.awardhub.awardhub.user.repository.NomineeRepository;
import com.awardhub.awardhub.voting.repository.VoteRepository;
import com.awardhub.awardhub.voting.entity.VoteStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResultsService {

    private final FinalScoreRepository finalScoreRepository;
    private final AwardCategoryRepository categoryRepository;
    private final NomineeRepository nomineeRepository;
    private final VoteRepository voteRepository;
    private final EvaluationRepository evaluationRepository;
    private final AuditLogService auditLogService;

    public ResultsService(FinalScoreRepository finalScoreRepository, AwardCategoryRepository categoryRepository,
                          NomineeRepository nomineeRepository, VoteRepository voteRepository,
                          EvaluationRepository evaluationRepository, AuditLogService auditLogService) {
        this.finalScoreRepository = finalScoreRepository;
        this.categoryRepository = categoryRepository;
        this.nomineeRepository = nomineeRepository;
        this.voteRepository = voteRepository;
        this.evaluationRepository = evaluationRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<FinalScoreResponse> getResultsByCategory(Long categoryId) {
        List<FinalScore> scores = finalScoreRepository.findByCategoryCategoryIdOrderByFinalScoreDesc(categoryId);
        return scores.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void calculateAndPublishResults(Long categoryId, Long userId) {
        AwardCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Get all approved nominees in this category
        // For now, we'll calculate scores for all nominees who have votes/evaluations
        List<Long> nomineeIds = new java.util.HashSet<>(
            voteRepository.findByCategoryId(categoryId).stream()
                .map(v -> v.getNominee().getUserID())
                .collect(Collectors.toList())
        ).stream().collect(Collectors.toList());

        double votingWeight = category.getVotingWeightage() != null ? category.getVotingWeightage() : 50;
        double judgingWeight = category.getJudgingWeightage() != null ? category.getJudgingWeightage() : 50;

        for (Long nomineeId : nomineeIds) {
            Nominee nominee = nomineeRepository.findById(nomineeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Nominee not found"));

            FinalScore finalScore = finalScoreRepository.findByNomineeUserIDAndCategoryCategoryId(nomineeId, categoryId)
                    .orElse(new FinalScore());

            finalScore.setNominee(nominee);
            finalScore.setCategory(category);

            // Calculate vote score
            long voteCount = voteRepository.countByNomineeUserIDAndCategoryCategoryIdAndStatus(
                    nomineeId, categoryId, VoteStatus.VALID);
            double voteScore = voteCount > 0 ? (voteCount / 10.0) : 0.0; // Normalize to 0-100
            finalScore.setVoteScore(voteScore);
            finalScore.setTotalVotes(voteCount);

            // Calculate judge score (average of all evaluations for this nominee)
            var evaluations = evaluationRepository.findByNominationId(nomineeId);
            double judgeScore = evaluations.stream()
                    .filter(e -> "COMPLETED".equals(e.getStatus()) && e.getTotalScore() != null)
                    .mapToDouble(e -> e.getTotalScore().doubleValue())
                    .average()
                    .orElse(0.0);
            finalScore.setJudgeScore(judgeScore);
            finalScore.setTotalEvaluations((long) evaluations.size());

            // Calculate final score based on evaluation method
            double finalScoreValue = calculateFinalScore(category.getEvaluationMethod(), 
                                                         voteScore, judgeScore, votingWeight, judgingWeight);
            finalScore.setFinalScore(finalScoreValue);

            finalScoreRepository.save(finalScore);
        }

        // Rank and mark winner
        rankAndMarkWinner(categoryId);
        
        auditLogService.log(userId, "RESULTS_PUBLISHED", "Category", categoryId, 
                           "Results published for category: " + category.getCategoryName());
    }

    private double calculateFinalScore(EvaluationMethod method, double voteScore, double judgeScore,
                                      double votingWeight, double judgingWeight) {
        switch (method) {
            case VOTING_ONLY:
                return voteScore;
            case JUDGING_ONLY:
                return judgeScore;
            case HYBRID:
                double totalWeight = votingWeight + judgingWeight;
                return (voteScore * (votingWeight / 100.0)) + (judgeScore * (judgingWeight / 100.0));
            default:
                return 0.0;
        }
    }

    private void rankAndMarkWinner(Long categoryId) {
        List<FinalScore> scores = finalScoreRepository.findByCategoryCategoryIdOrderByFinalScoreDesc(categoryId);
        
        for (int i = 0; i < scores.size(); i++) {
            scores.get(i).setRank(i + 1);
            scores.get(i).setIsWinner(i == 0);
            finalScoreRepository.save(scores.get(i));
        }
    }

    private FinalScoreResponse toResponse(FinalScore score) {
        return new FinalScoreResponse(
            score.getScoreId(),
            score.getNominee().getUserID(),
            score.getNominee().getEmail(),
            score.getCategory().getCategoryId(),
            score.getVoteScore(),
            score.getJudgeScore(),
            score.getFinalScore(),
            score.getTotalVotes(),
            score.getTotalEvaluations(),
            score.getRank(),
            score.getIsWinner()
        );
    }
}
