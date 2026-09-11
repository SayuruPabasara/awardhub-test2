package com.awardhub.awardhub.reports.controller;

import com.awardhub.awardhub.common.dto.ApiResponse;
import com.awardhub.awardhub.reports.dto.AuditLogDTO;
import com.awardhub.awardhub.reports.dto.CategoryStatisticsDTO;
import com.awardhub.awardhub.reports.service.ReportsService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    private final ReportsService reportsService;

    public ReportsController(ReportsService reportsService) {
        this.reportsService = reportsService;
    }

    @GetMapping("/category/{categoryId}")
    @PreAuthorize("hasAnyRole('AWARD_ORGANIZER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<CategoryStatisticsDTO>> getCategoryStatistics(@PathVariable Long categoryId) {
        CategoryStatisticsDTO stats = reportsService.getCategoryStatistics(categoryId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('AWARD_ORGANIZER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<List<CategoryStatisticsDTO>>> getAllCategoryStatistics() {
        List<CategoryStatisticsDTO> stats = reportsService.getAllCategoryStatistics();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'AWARD_ORGANIZER')")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAuditLogs(Pageable pageable) {
        Page<AuditLogDTO> logs = reportsService.getAuditLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/audit-logs/action/{action}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'AWARD_ORGANIZER')")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAuditLogsByAction(
            @PathVariable String action,
            Pageable pageable
    ) {
        Page<AuditLogDTO> logs = reportsService.getAuditLogsByAction(action, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/audit-logs/user/{userId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'AWARD_ORGANIZER')")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAuditLogsByUser(
            @PathVariable Long userId,
            Pageable pageable
    ) {
        Page<AuditLogDTO> logs = reportsService.getAuditLogsByUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
