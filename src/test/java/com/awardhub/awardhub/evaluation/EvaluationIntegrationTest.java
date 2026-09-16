package com.awardhub.awardhub.evaluation;

import com.awardhub.awardhub.category.entity.AwardCategory;
import com.awardhub.awardhub.category.entity.CategoryStatus;
import com.awardhub.awardhub.category.repository.AwardCategoryRepository;
import com.awardhub.awardhub.common.exception.BadRequestException;
import com.awardhub.awardhub.evaluation.dto.EvaluationRequest;
import com.awardhub.awardhub.evaluation.entity.Evaluation;
import com.awardhub.awardhub.evaluation.repository.EvaluationRepository;
import com.awardhub.awardhub.evaluation.service.EvaluationService;
import com.awardhub.awardhub.nomination.dto.EvaluationAssignmentRequest;
import com.awardhub.awardhub.nomination.entity.Nomination;
import com.awardhub.awardhub.nomination.entity.NominationStatus;
import com.awardhub.awardhub.nomination.repository.NominationRepository;
import com.awardhub.awardhub.user.entity.*;
import com.awardhub.awardhub.user.repository.NomineeRepository;
import com.awardhub.awardhub.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class EvaluationIntegrationTest {

    @Autowired
    private EvaluationService evaluationService;

    @Autowired
    private EvaluationRepository evaluationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NomineeRepository nomineeRepository;

    @Autowired
    private AwardCategoryRepository categoryRepository;

    @Autowired
    private NominationRepository nominationRepository;

    private Judge judge;
    private Nominee nominee;
    private AwardCategory category;
    private Nomination nomination;
    private Evaluation evaluation;

    @BeforeEach
    public void setUp() {
        // Create judge
        judge = new Judge();
        judge.setEmail("judge@test.com");
        judge.setPassword("password123");
        judge.setContactNumber("1234567890");
        judge.setAreaOfExpertise("Computer Science");
        judge.setAccountStatus(AccountStatus.ACTIVE);
        judge = (Judge) userRepository.save(judge);

        // Create nominee
        nominee = new Nominee();
        nominee.setEmail("nominee@test.com");
        nominee.setPassword("password123");
        nominee.setContactNumber("0987654321");
        nominee.setAccountStatus(AccountStatus.ACTIVE);
        nominee = nomineeRepository.save(nominee);

        // Create category with default rubric
        category = new AwardCategory();
        category.setCategoryName("Best Innovation");
        category.setStatus(CategoryStatus.UNDER_EVALUATION);
        category.setEvaluationMethod(com.awardhub.awardhub.category.entity.EvaluationMethod.HYBRID);
        category.setRubricCriteria(AwardCategory.getDefaultRubric());
        category = categoryRepository.save(category);

        // Create nomination
        nomination = new Nomination();
        nomination.setNominee(nominee);
        nomination.setCategory(category);
        nomination.setTitle("Great Innovation");
        nomination.setAchievementDescription("Pioneering autonomous navigation algorithm for robotics.");
        nomination.setStatus(NominationStatus.APPROVED);
        nomination.setSubmissionDate(LocalDateTime.now());
        nomination = nominationRepository.save(nomination);

        // Create evaluation
        evaluation = new Evaluation();
        evaluation.setNomination(nomination);
        evaluation.setJudge(judge);
        evaluation.setCategory(category);
        evaluation.setStatus("PENDING");
        evaluation.setSubmissionDate(LocalDateTime.now());
        evaluation.setCriterionScores("{}");
        evaluation = evaluationRepository.save(evaluation);
    }

    @Test
    public void testGetMyAssignments() {
        // Act
        var assignments = evaluationService.getMyAssignments(judge.getUserID());

        // Assert
        assertNotNull(assignments);
        assertTrue(assignments.size() > 0);
        assertEquals("PENDING", assignments.get(0).getStatus());
        assertEquals("Great Innovation", assignments.get(0).getNominationTitle());
        assertNotNull(assignments.get(0).getRubric());
        assertEquals(5, assignments.get(0).getRubric().size());
    }

    @Test
    public void testGetPendingAssignments() {
        // Act
        var pending = evaluationService.getPendingAssignments(judge.getUserID());

        // Assert
        assertNotNull(pending);
        assertEquals(1, pending.size());
        assertEquals("PENDING", pending.get(0).getStatus());
    }

    @Test
    public void testSubmitEvaluationSuccessfully() {
        // Arrange
        Map<String, Integer> scores = new HashMap<>();
        scores.put("innovation", 85);
        scores.put("impact", 90);
        scores.put("feasibility", 80);
        scores.put("presentation", 75);
        scores.put("ethics", 95);

        EvaluationRequest request = new EvaluationRequest();
        request.setNominationId(nomination.getNominationId());
        request.setScores(scores);
        request.setComments("Excellent work on this innovation project");

        // Act
        var response = evaluationService.submitEvaluation(evaluation.getEvaluationId(), judge.getUserID(), request);

        // Assert
        assertNotNull(response);
        assertEquals("COMPLETED", response.getStatus());
        assertNotNull(response.getTotalScore());
        assertTrue(response.getTotalScore() > 0);
        assertEquals("Excellent work on this innovation project", response.getComments());
        assertNotNull(response.getCriterionScores());
        assertEquals(85, response.getCriterionScores().get("innovation"));

        // Verify evaluation is updated in database
        Evaluation updated = evaluationRepository.findById(evaluation.getEvaluationId()).get();
        assertEquals("COMPLETED", updated.getStatus());
        assertNotNull(updated.getTotalScore());
    }

    @Test
    public void testSubmitEvaluationUnauthorized() {
        // Arrange
        Judge otherJudge = new Judge();
        otherJudge.setEmail("otherjudge@test.com");
        otherJudge.setPassword("password123");
        otherJudge.setContactNumber("5555555555");
        otherJudge.setAccountStatus(AccountStatus.ACTIVE);
        
        Judge savedOtherJudge = (Judge) userRepository.save(otherJudge);

        Map<String, Integer> scores = new HashMap<>();
        scores.put("innovation", 85);

        EvaluationRequest request = new EvaluationRequest();
        request.setScores(scores);

        // Act & Assert
        assertThrows(BadRequestException.class, () ->
            evaluationService.submitEvaluation(evaluation.getEvaluationId(), savedOtherJudge.getUserID(), request)
        );
    }

    @Test
    public void testCannotResubmitCompleteEvaluation() {
        // Arrange
        Map<String, Integer> scores = new HashMap<>();
        scores.put("innovation", 85);
        EvaluationRequest request = new EvaluationRequest();
        request.setScores(scores);

        // First submission succeeds
        evaluationService.submitEvaluation(evaluation.getEvaluationId(), judge.getUserID(), request);

        // Act & Assert - second submission fails
        assertThrows(BadRequestException.class, () ->
            evaluationService.submitEvaluation(evaluation.getEvaluationId(), judge.getUserID(), request)
        );
    }

    @Test
    public void testOrganizerGetAllEvaluations() {
        var list = evaluationService.getAllEvaluations(category.getCategoryId(), nomination.getNominationId(), "PENDING");
        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals(judge.getEmail(), list.get(0).getJudgeEmail());
        assertNotNull(list.get(0).getNominationSummary());
    }

    @Test
    public void testOrganizerAssignJudges() {
        // Create second judge
        Judge judge2 = new Judge();
        judge2.setEmail("judge2@test.com");
        judge2.setPassword("password123");
        judge2.setContactNumber("9999999999");
        judge2.setAccountStatus(AccountStatus.ACTIVE);
        judge2 = (Judge) userRepository.save(judge2);

        EvaluationAssignmentRequest assignReq = new EvaluationAssignmentRequest(nomination.getNominationId(), List.of(judge2.getUserID()));
        var assigned = evaluationService.assignJudgesToNomination(assignReq, 1L);

        assertEquals(1, assigned.size());
        assertEquals(judge2.getUserID(), assigned.get(0).getJudgeId());
    }
}
