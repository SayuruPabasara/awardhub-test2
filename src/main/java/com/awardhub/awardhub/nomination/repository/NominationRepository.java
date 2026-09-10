package com.awardhub.awardhub.nomination.repository;

import com.awardhub.awardhub.nomination.entity.Nomination;
import com.awardhub.awardhub.nomination.entity.NominationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NominationRepository extends JpaRepository<Nomination, Long> {

    @Query("SELECT n FROM Nomination n JOIN FETCH n.nominee JOIN FETCH n.category WHERE n.nominee.userID = :nomineeId")
    List<Nomination> findByNomineeId(@Param("nomineeId") Long nomineeId);

    @Query("SELECT n FROM Nomination n JOIN FETCH n.nominee JOIN FETCH n.category WHERE n.category.categoryId = :categoryId")
    List<Nomination> findByCategoryId(@Param("categoryId") Long categoryId);

    List<Nomination> findByStatus(NominationStatus status);

    @Query("SELECT n FROM Nomination n JOIN FETCH n.nominee JOIN FETCH n.category WHERE n.category.categoryId = :categoryId AND n.status = 'APPROVED'")
    List<Nomination> findApprovedByCategoryId(@Param("categoryId") Long categoryId);

    boolean existsByNomineeUserIDAndCategoryCategoryId(Long nomineeId, Long categoryId);

    @Query("SELECT n FROM Nomination n LEFT JOIN FETCH n.documents WHERE n.nominationId = :id")
    Optional<Nomination> findByIdWithDocuments(@Param("id") Long id);
}
