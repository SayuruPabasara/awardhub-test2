package com.awardhub.awardhub.results;

import com.awardhub.awardhub.category.entity.AwardCategory;
import com.awardhub.awardhub.category.entity.CategoryStatus;
import com.awardhub.awardhub.category.repository.AwardCategoryRepository;
import com.awardhub.awardhub.evaluation.entity.Evaluation;
import com.awardhub.awardhub.evaluation.repository.EvaluationRepository;
import com.awardhub.awardhub.nomination.entity.Nomination;
import com.awardhub.awardhub.nomination.entity.NominationStatus;
import com.awardhub.awardhub.nomination.repository.NominationRepository;
import com.awardhub.awardhub.results.dto.FinalScoreResponse;
import com.awardhub.awardhub.results.entity.FinalScore;
import com.awardhub.awardhub.results.repository.FinalScoreRepository;
import com.awardhub.awardhub.results.service.ResultsService;
import com.awardhub.awardhub.user.entity.*;
import com.awardhub.awardhub.user.repository.NomineeRepository;
import com.awardhub.awardhub.user.repository.UserRepository;
import com.awardhub.awardhub.voting.entity.Vote;
import com.awardhub.awardhub.voting.entity.VoteStatus;
import com.awardhub.awardhub.voting.repository.VoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class ResultsIntegrationTest {

    @Autowired
    private ResultsService resultsService;

    @Autowired
    private FinalScoreRepository finalScoreRepository;

    @Autowired
    private VoteRepository voteRepository;

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

    private Voter voter;
    private Judge judge;
    private Nominee nominee;
    private AwardOrganizer organizer;
    private AwardCategory category;
    private Nomination nomination;

    @BeforeEach
    public void setUp() {
        // Create users
        voter = new Voter();
        voter.setEmail("voter@test.com");
        voter.setPassword("password123");
        voter.setContactNumber("1234567890");
        voter.setAccountStatus(AccountStatus.ACTIVE);
        voter = (Voter) userRepository.save(voter);

        judge = new Judge();
        judge.setEmail("judge@test.com");
        judge.setPassword("password123");
        judge.setContactNumber("2345678901");
        judge.setAccountStatus(AccountStatus.ACTIVE);
        judge = (Judge) userRepository.save(judge);

        nominee = new Nominee();
        nominee.setEmail("nominee@test.com");
        nominee.setPassword("password123");
        nominee.setContactNumber("3456789012");
        nominee.setAccountStatus(AccountStatus.ACTIVE);
        nominee = nomineeRepository.save(nominee);

        organizer = new AwardOrganizer();
        organizer.setEmail("organizer@test.com");
        organizer.setPassword("password123");
        organizer.setContactNumber("4567890123");
        organizer.setAccountStatus(AccountStatus.ACTIVE);
        organizer = (AwardOrganizer) userRepository.save(organizer);

        // Create category
        category = new AwardCategory();
        category.setCategoryName("Best Innovation");
        category.setStatus(CategoryStatus.RESULTS_READY);
        category.setEvaluationMethod(com.awardhub.awardhub.category.entity.EvaluationMethod.HYBRID);
        category.setVotingWeightage(50.0);
        category.setJudgingWeightage(50.0);
        category = categoryRepository.save(category);

        // Create nomination
        nomination = new Nomination();
        nomination.setNominee(nominee);
        nomination.setCategory(category);
        nomination.setTitle("Great Innovation");
        nomination.setAchievementDescription("Pioneering innovation in robotics");
        nomination.setStatus(NominationStatus.APPROVED);
        nomination.setSubmissionDate(LocalDateTime.now());
        nomination = nominationRepository.save(nomination);

        // Create vote
        Vote vote = new Vote();
        vote.setVoter(voter);
        vote.setNominee(nominee);
        vote.setCategory(category);
        vote.setStatus(VoteStatus.VALID);
        vote.setVoteTimestamp(LocalDateTime.now());
        voteRepository.save(vote);

        // Create evaluation
        Evaluation evaluation = new Evaluation();
        evaluation.setNomination(nomination);
        evaluation.setJudge(judge);
        evaluation.setCategory(category);
        evaluation.setStatus("COMPLETED");
        evaluation.setTotalScore(90.0);
        evaluation.setCriterionScores("{\"innovation\":90}");
        evaluation.setSubmissionDate(LocalDateTime.now());
        evaluationRepository.save(evaluation);
    }

    @Test
    public void testCalculateAndPublishResults() {
        // Act
        resultsService.calculateAndPublishResults(category.getCategoryId(), organizer.getUserID());

        // Assert
        List<FinalScore> scores = finalScoreRepository.findByCategoryCategoryIdOrderByFinalScoreDesc(category.getCategoryId());
        assertTrue(scores.size() > 0);

        FinalScore topScore = scores.get(0);
        assertNotNull(topScore.getFinalScore());
        assertTrue(topScore.getFinalScore() > 0);
        assertTrue(topScore.getIsWinner());
        assertEquals(1, topScore.getRank());
    }

    @Test
    public void testGetResultsByCategory() {
        // Arrange
        resultsService.calculateAndPublishResults(category.getCategoryId(), organizer.getUserID());

        // Act
        List<FinalScoreResponse> results = resultsService.getResultsByCategory(category.getCategoryId());

        // Assert
        assertTrue(results.size() > 0);
        assertEquals(nominee.getUserID(), results.get(0).getNomineeId());
        assertTrue(results.get(0).getIsWinner());
    }

    @Test
    public void testResultsAreRanked() {
        // Arrange - create second nominee with lower score
        Nominee nominee2 = new Nominee();
        nominee2.setEmail("nominee2@test.com");
        nominee2.setPassword("password123");
        nominee2.setContactNumber("5555555555");
        nominee2.setAccountStatus(AccountStatus.ACTIVE);
        nominee2 = nomineeRepository.save(nominee2);

        Nomination nomination2 = new Nomination();
        nomination2.setNominee(nominee2);
        nomination2.setCategory(category);
        nomination2.setTitle("Good Innovation");
        nomination2.setStatus(NominationStatus.APPROVED);
        nominationRepository.save(nomination2);

        Evaluation eval2 = new Evaluation();
        eval2.setNomination(nomination2);
        eval2.setJudge(judge);
        eval2.setCategory(category);
        eval2.setStatus("COMPLETED");
        eval2.setTotalScore(70.0);
        eval2.setCriterionScores("{\"innovation\":70}");
        evaluationRepository.save(eval2);

        // Act
        resultsService.calculateAndPublishResults(category.getCategoryId(), organizer.getUserID());

        // Assert
        List<FinalScoreResponse> results = resultsService.getResultsByCategory(category.getCategoryId());
        assertEquals(2, results.size());
        assertEquals(1, results.get(0).getRank());
        assertEquals(2, results.get(1).getRank());
        assertTrue(results.get(0).getIsWinner());
        assertFalse(results.get(1).getIsWinner());
    }
}
