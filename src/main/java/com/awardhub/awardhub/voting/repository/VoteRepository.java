package com.awardhub.awardhub.voting.repository;

import com.awardhub.awardhub.voting.entity.Vote;
import com.awardhub.awardhub.voting.entity.VoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    @Query("SELECT v FROM Vote v JOIN FETCH v.nominee JOIN FETCH v.category WHERE v.voter.userID = :voterId")
    List<Vote> findByVoterId(@Param("voterId") Long voterId);

    @Query("SELECT v FROM Vote v JOIN FETCH v.nominee JOIN FETCH v.voter WHERE v.category.categoryId = :categoryId")
    List<Vote> findByCategoryId(@Param("categoryId") Long categoryId);

    Optional<Vote> findByVoterUserIDAndNomineeUserIDAndCategoryCategoryId(
            Long voterId, Long nomineeId, Long categoryId
    );

    boolean existsByVoterUserIDAndNomineeUserIDAndCategoryCategoryIdAndStatus(
            Long voterId, Long nomineeId, Long categoryId, VoteStatus status
    );

    long countByVoterUserIDAndCategoryCategoryIdAndStatus(
            Long voterId, Long categoryId, VoteStatus status
    );

    long countByNomineeUserIDAndCategoryCategoryIdAndStatus(
            Long nomineeId, Long categoryId, VoteStatus status
    );

    long countByCategoryCategoryIdAndStatus(Long categoryId, VoteStatus status);

    @Query("SELECT v.nominee.userID, COUNT(v) FROM Vote v WHERE v.category.categoryId = :categoryId AND v.status = 'VALID' GROUP BY v.nominee.userID")
    List<Object[]> countVotesPerNomineeForCategory(@Param("categoryId") Long categoryId);
}
