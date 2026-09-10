package com.awardhub.awardhub.voting;

import com.awardhub.awardhub.category.entity.AwardCategory;
import com.awardhub.awardhub.category.entity.CategoryStatus;
import com.awardhub.awardhub.category.repository.AwardCategoryRepository;
import com.awardhub.awardhub.common.exception.BadRequestException;
import com.awardhub.awardhub.user.entity.*;
import com.awardhub.awardhub.user.repository.NomineeRepository;
import com.awardhub.awardhub.user.repository.UserRepository;
import com.awardhub.awardhub.voting.entity.Vote;
import com.awardhub.awardhub.voting.entity.VoteStatus;
import com.awardhub.awardhub.voting.repository.VoteRepository;
import com.awardhub.awardhub.voting.service.VoteService;
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
public class VotingIntegrationTest {

    @Autowired
    private VoteService voteService;

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NomineeRepository nomineeRepository;

    @Autowired
    private AwardCategoryRepository categoryRepository;

    private Voter voter;
    private Nominee nominee;
    private AwardCategory category;

    @BeforeEach
    public void setUp() {
        // Create test voter
        voter = new Voter();
        voter.setEmail("voter@test.com");
        voter.setPassword("password123");
        voter.setContactNumber("1234567890");
        voter.setAccountStatus(AccountStatus.ACTIVE);
        voter = (Voter) userRepository.save(voter);

        // Create test nominee
        nominee = new Nominee();
        nominee.setEmail("nominee@test.com");
        nominee.setPassword("password123");
        nominee.setContactNumber("0987654321");
        nominee.setAccountStatus(AccountStatus.ACTIVE);
        nominee = nomineeRepository.save(nominee);

        // Create test category
        category = new AwardCategory();
        category.setCategoryName("Best Innovation");
        category.setDescription("Award for best innovation");
        category.setStatus(CategoryStatus.VOTING_OPEN);
        category.setEvaluationMethod(com.awardhub.awardhub.category.entity.EvaluationMethod.HYBRID);
        category.setVotingStartDate(LocalDateTime.now());
        category.setVotingEndDate(LocalDateTime.now().plusDays(7));
        category = categoryRepository.save(category);
    }

    @Test
    public void testSubmitVoteSuccessfully() {
        // Act
        var response = voteService.submitVote(voter.getUserID(), category.getCategoryId(), nominee.getUserID());

        // Assert
        assertNotNull(response);
        assertNotNull(response.getVoteId());
        assertEquals(nominee.getUserID(), response.getNomineeId());
        assertEquals(voter.getUserID(), response.getVoterId());
        assertEquals("VALID", response.getStatus());

        // Verify vote is saved in repository
        List<Vote> votes = voteRepository.findByVoterId(voter.getUserID());
        assertEquals(1, votes.size());
    }

    @Test
    public void testDuplicateVoteThrowsException() {
        // Act & Assert - first vote succeeds
        voteService.submitVote(voter.getUserID(), category.getCategoryId(), nominee.getUserID());

        // Second vote to same nominee in same category should fail
        assertThrows(BadRequestException.class, () ->
            voteService.submitVote(voter.getUserID(), category.getCategoryId(), nominee.getUserID())
        );
    }

    @Test
    public void testGetMyVotes() {
        // Arrange - submit multiple votes
        voteService.submitVote(voter.getUserID(), category.getCategoryId(), nominee.getUserID());
        
        Nominee nominee2 = new Nominee();
        nominee2.setEmail("nominee2@test.com");
        nominee2.setPassword("password123");
        nominee2.setContactNumber("5555555555");
        nominee2.setAccountStatus(AccountStatus.ACTIVE);
        nominee2 = nomineeRepository.save(nominee2);
        
        AwardCategory category2 = new AwardCategory();
        category2.setCategoryName("Best Leadership");
        category2.setStatus(CategoryStatus.VOTING_OPEN);
        category2.setEvaluationMethod(com.awardhub.awardhub.category.entity.EvaluationMethod.VOTING_ONLY);
        category2 = categoryRepository.save(category2);
        
        voteService.submitVote(voter.getUserID(), category2.getCategoryId(), nominee2.getUserID());

        // Act
        var votes = voteService.getMyVotes(voter.getUserID());

        // Assert
        assertEquals(2, votes.size());
        assertTrue(votes.stream().anyMatch(v -> v.getCategoryId().equals(category.getCategoryId())));
        assertTrue(votes.stream().anyMatch(v -> v.getCategoryId().equals(category2.getCategoryId())));
    }

    @Test
    public void testGetVotesByCategory() {
        // Arrange
        voteService.submitVote(voter.getUserID(), category.getCategoryId(), nominee.getUserID());

        // Act
        var votes = voteService.getVotesByCategory(category.getCategoryId());

        // Assert
        assertEquals(1, votes.size());
        assertEquals(category.getCategoryId(), votes.get(0).getCategoryId());
    }
}
