package com.awardhub.awardhub.results.repository;

import com.awardhub.awardhub.results.entity.FinalScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FinalScoreRepository extends JpaRepository<FinalScore, Long> {

    Optional<FinalScore> findByNomineeUserIDAndCategoryCategoryId(Long nomineeId, Long categoryId);

    List<FinalScore> findByCategoryCategoryIdOrderByFinalScoreDesc(Long categoryId);

    @Query("SELECT fs FROM FinalScore fs WHERE fs.category.categoryId = :categoryId AND fs.isWinner = true")
    Optional<FinalScore> findWinnerByCategory(@Param("categoryId") Long categoryId);

    List<FinalScore> findByCategoryCategoryId(Long categoryId);
}
