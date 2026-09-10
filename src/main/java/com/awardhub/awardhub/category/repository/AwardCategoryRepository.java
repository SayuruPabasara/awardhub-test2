package com.awardhub.awardhub.category.repository;

import com.awardhub.awardhub.category.entity.AwardCategory;
import com.awardhub.awardhub.category.entity.CategoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AwardCategoryRepository extends JpaRepository<AwardCategory, Long> {

    Optional<AwardCategory> findByCategoryName(String categoryName);

    boolean existsByCategoryName(String categoryName);

    List<AwardCategory> findByStatus(CategoryStatus status);

    @Query("SELECT c FROM AwardCategory c WHERE c.status = 'NOMINATIONS_OPEN' AND (c.nominationDeadline IS NULL OR c.nominationDeadline > :now)")
    List<AwardCategory> findOpenForNomination(@Param("now") LocalDateTime now);

    @Query("SELECT c FROM AwardCategory c WHERE c.status = 'VOTING_OPEN' AND c.votingStartDate <= :now AND (c.votingEndDate IS NULL OR c.votingEndDate >= :now)")
    List<AwardCategory> findOpenForVoting(@Param("now") LocalDateTime now);
}
