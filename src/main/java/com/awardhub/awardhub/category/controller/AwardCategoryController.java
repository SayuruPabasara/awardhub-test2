package com.awardhub.awardhub.category.controller;

import com.awardhub.awardhub.category.dto.CategoryResponse;
import com.awardhub.awardhub.category.dto.CreateCategoryRequest;
import com.awardhub.awardhub.category.dto.UpdateCategoryRequest;
import com.awardhub.awardhub.category.entity.CategoryStatus;
import com.awardhub.awardhub.category.service.AwardCategoryService;
import com.awardhub.awardhub.common.dto.ApiResponse;
import com.awardhub.awardhub.user.entity.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class AwardCategoryController {

    private final AwardCategoryService categoryService;

    public AwardCategoryController(AwardCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories(
            @RequestParam(required = false) CategoryStatus status
    ) {
        List<CategoryResponse> categories = categoryService.getAllCategories(status);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @GetMapping("/open-for-nomination")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getOpenForNomination() {
        List<CategoryResponse> categories = categoryService.getCategoriesOpenForNomination();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/open-for-voting")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getOpenForVoting() {
        List<CategoryResponse> categories = categoryService.getCategoriesOpenForVoting();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('AWARD_ORGANIZER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CreateCategoryRequest request,
            @AuthenticationPrincipal User user
    ) {
        CategoryResponse created = categoryService.createCategory(request, user != null ? user.getUserID() : null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('AWARD_ORGANIZER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request,
            @AuthenticationPrincipal User user
    ) {
        CategoryResponse updated = categoryService.updateCategory(id, request, user != null ? user.getUserID() : null);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('AWARD_ORGANIZER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategoryStatus(
            @PathVariable Long id,
            @RequestParam CategoryStatus status,
            @AuthenticationPrincipal User user
    ) {
        CategoryResponse updated = categoryService.updateCategoryStatus(id, status, user != null ? user.getUserID() : null);
        return ResponseEntity.ok(ApiResponse.success("Category status updated to " + status, updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('AWARD_ORGANIZER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        categoryService.deleteCategory(id, user != null ? user.getUserID() : null);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
}
