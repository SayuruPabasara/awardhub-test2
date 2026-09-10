package com.awardhub.awardhub.evaluation.repository;

import com.awardhub.awardhub.evaluation.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    @Query("SELECT e FROM Evaluation e WHERE e.judge.userID = :judgeId AND e.status = 'PENDING'")
    List<Evaluation> findPendingByJudgeId(@Param("judgeId") Long judgeId);

    @Query("SELECT e FROM Evaluation e WHERE e.judge.userID = :judgeId")
    List<Evaluation> findByJudgeId(@Param("judgeId") Long judgeId);

    @Query("SELECT e FROM Evaluation e WHERE e.nomination.nominationId = :nominationId")
    List<Evaluation> findByNominationId(@Param("nominationId") Long nominationId);

    Optional<Evaluation> findByNominationNominationIdAndJudgeUserID(Long nominationId, Long judgeId);

    List<Evaluation> findByCategoryCategoryId(Long categoryId);
}
