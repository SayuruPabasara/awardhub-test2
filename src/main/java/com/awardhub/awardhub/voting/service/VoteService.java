package com.awardhub.awardhub.voting.service;

import com.awardhub.awardhub.category.entity.AwardCategory;
import com.awardhub.awardhub.category.repository.AwardCategoryRepository;
import com.awardhub.awardhub.common.audit.AuditLogService;
import com.awardhub.awardhub.common.exception.BadRequestException;
import com.awardhub.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.awardhub.user.entity.Nominee;
import com.awardhub.awardhub.user.entity.Voter;
import com.awardhub.awardhub.user.repository.NomineeRepository;
import com.awardhub.awardhub.user.repository.VoterRepository;
import com.awardhub.awardhub.voting.dto.VoteResponse;
import com.awardhub.awardhub.voting.entity.Vote;
import com.awardhub.awardhub.voting.entity.VoteStatus;
import com.awardhub.awardhub.voting.repository.VoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final VoterRepository voterRepository;
    private final NomineeRepository nomineeRepository;
    private final AwardCategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public VoteService(VoteRepository voteRepository, VoterRepository voterRepository,
                       NomineeRepository nomineeRepository, AwardCategoryRepository categoryRepository,
                       AuditLogService auditLogService) {
        this.voteRepository = voteRepository;
        this.voterRepository = voterRepository;
        this.nomineeRepository = nomineeRepository;
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<VoteResponse> getMyVotes(Long voterId) {
        List<Vote> votes = voteRepository.findByVoterId(voterId);
        return votes.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VoteResponse> getVotesByCategory(Long categoryId) {
        List<Vote> votes = voteRepository.findByCategoryId(categoryId);
        return votes.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public VoteResponse submitVote(Long voterId, Long categoryId, Long nomineeId) {
        Voter voter = voterRepository.findById(voterId)
                .orElseThrow(() -> new ResourceNotFoundException("Voter not found"));
        
        Nominee nominee = nomineeRepository.findById(nomineeId)
                .orElseThrow(() -> new ResourceNotFoundException("Nominee not found"));
        
        AwardCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Check if already voted
        if (voteRepository.existsByVoterUserIDAndNomineeUserIDAndCategoryCategoryIdAndStatus(
                voterId, nomineeId, categoryId, VoteStatus.VALID)) {
            throw new BadRequestException("You have already voted for this nominee in this category");
        }

        Vote vote = new Vote();
        vote.setVoter(voter);
        vote.setNominee(nominee);
        vote.setCategory(category);
        vote.setStatus(VoteStatus.VALID);

        Vote saved = voteRepository.save(vote);
        auditLogService.log(voterId, "VOTE_CAST", "Vote", saved.getVoteId(), 
                           "Voter " + voter.getEmail() + " voted for " + nominee.getUserID() + " in category " + category.getCategoryName());
        
        return toResponse(saved);
    }

    private VoteResponse toResponse(Vote vote) {
        return new VoteResponse(
            vote.getVoteId(),
            vote.getCategory().getCategoryId(),
            vote.getNominee().getUserID(),
            vote.getVoter().getUserID(),
            vote.getVoteTimestamp(),
            vote.getStatus().toString()
        );
    }
}
