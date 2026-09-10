package com.awardhub.awardhub.reports.service;

import com.awardhub.awardhub.category.repository.AwardCategoryRepository;
import com.awardhub.awardhub.common.audit.AuditLog;
import com.awardhub.awardhub.common.audit.AuditLogRepository;
import com.awardhub.awardhub.evaluation.repository.EvaluationRepository;
import com.awardhub.awardhub.nomination.repository.NominationRepository;
import com.awardhub.awardhub.reports.dto.AuditLogDTO;
import com.awardhub.awardhub.reports.dto.CategoryStatisticsDTO;
import com.awardhub.awardhub.user.repository.UserRepository;
import com.awardhub.awardhub.voting.repository.VoteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportsService {

    private final NominationRepository nominationRepository;
    private final VoteRepository voteRepository;
    private final EvaluationRepository evaluationRepository;
    private final AwardCategoryRepository categoryRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public ReportsService(NominationRepository nominationRepository, VoteRepository voteRepository,
                          EvaluationRepository evaluationRepository, AwardCategoryRepository categoryRepository,
                          AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.nominationRepository = nominationRepository;
        this.voteRepository = voteRepository;
        this.evaluationRepository = evaluationRepository;
        this.categoryRepository = categoryRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public CategoryStatisticsDTO getCategoryStatistics(Long categoryId) {
        var category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        long totalNominations = nominationRepository.findByCategoryId(categoryId).size();
        long approvedNominations = nominationRepository.findApprovedByCategoryId(categoryId).size();
        long rejectedNominations = nominationRepository.findByCategoryId(categoryId).stream()
                .filter(n -> "REJECTED".equals(n.getStatus().toString()))
                .count();
        long totalVotes = voteRepository.findByCategoryId(categoryId).size();
        long totalEvaluators = evaluationRepository.findAll().stream()
                .filter(e -> e.getCategory().getCategoryId().equals(categoryId))
                .map(e -> e.getJudge().getUserID())
                .distinct()
                .count();

        double avgVoteScore = voteRepository.findByCategoryId(categoryId).stream()
                .count() > 0 ? (double) totalVotes / 10 : 0.0;

        double avgJudgeScore = evaluationRepository.findAll().stream()
                .filter(e -> e.getCategory().getCategoryId().equals(categoryId) && "COMPLETED".equals(e.getStatus()))
                .mapToDouble(e -> e.getTotalScore() != null ? e.getTotalScore() : 0.0)
                .average()
                .orElse(0.0);

        return new CategoryStatisticsDTO(categoryId, category.getCategoryName(), totalNominations,
                                        approvedNominations, rejectedNominations, totalVotes,
                                        totalEvaluators, avgVoteScore, avgJudgeScore);
    }

    public List<CategoryStatisticsDTO> getAllCategoryStatistics() {
        return categoryRepository.findAll().stream()
                .map(cat -> getCategoryStatistics(cat.getCategoryId()))
                .collect(Collectors.toList());
    }

    public Page<AuditLogDTO> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable).map(this::toDTO);
    }

    public Page<AuditLogDTO> getAuditLogsByAction(String action, Pageable pageable) {
        return auditLogRepository.findByActionTypeOrderByTimestampDesc(action, pageable).map(this::toDTO);
    }

    public Page<AuditLogDTO> getAuditLogsByUser(Long userId, Pageable pageable) {
        return auditLogRepository.findByPerformedByUserIdOrderByTimestampDesc(userId, pageable).map(this::toDTO);
    }

    private AuditLogDTO toDTO(AuditLog log) {
        var user = userRepository.findById(log.getPerformedByUserId()).orElse(null);
        String userEmail = user != null ? user.getEmail() : "Unknown";
        return new AuditLogDTO(log.getLogID(), log.getPerformedByUserId(), userEmail, log.getActionType(),
                              log.getEntityType(), log.getEntityId(), log.getDetails(),
                              log.getTimestamp().toString());
    }
}
