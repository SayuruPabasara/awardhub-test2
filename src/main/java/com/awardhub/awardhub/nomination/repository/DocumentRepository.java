package com.awardhub.awardhub.nomination.repository;

import com.awardhub.awardhub.nomination.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByNominationNominationId(Long nominationId);

    Optional<Document> findByNominationNominationIdAndDocumentType(Long nominationId, String documentType);
}
