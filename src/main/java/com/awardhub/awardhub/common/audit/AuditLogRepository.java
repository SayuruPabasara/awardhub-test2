package com.awardhub.awardhub.common.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);

    List<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId);

    List<AuditLog> findByPerformedByUserId(Long userId);

    Page<AuditLog> findByActionTypeOrderByTimestampDesc(String actionType, Pageable pageable);

    Page<AuditLog> findByPerformedByUserIdOrderByTimestampDesc(Long userId, Pageable pageable);
}
