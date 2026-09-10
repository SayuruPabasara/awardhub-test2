package com.awardhub.awardhub.user.controller;

import com.awardhub.awardhub.common.dto.ApiResponse;
import com.awardhub.awardhub.user.dto.UserCreateRequest;
import com.awardhub.awardhub.user.dto.UserDTO;
import com.awardhub.awardhub.user.dto.UserUpdateRequest;
import com.awardhub.awardhub.user.entity.User;
import com.awardhub.awardhub.user.entity.UserRole;
import com.awardhub.awardhub.user.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {

    private final UserService userService;

    public UserManagementController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'AWARD_ORGANIZER')")
    public ResponseEntity<ApiResponse<Page<UserDTO>>> getAllUsers(Pageable pageable) {
        Page<UserDTO> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'AWARD_ORGANIZER')")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long userId) {
        UserDTO user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'AWARD_ORGANIZER')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getUsersByRole(@PathVariable String role) {
        UserRole userRole = UserRole.valueOf(role.toUpperCase());
        List<UserDTO> users = userService.getUsersByRole(userRole);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'AWARD_ORGANIZER')")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByEmail(@PathVariable String email) {
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<UserDTO>> createUser(
            @RequestBody UserCreateRequest request,
            @AuthenticationPrincipal User user
    ) {
        UserDTO created = userService.createUser(request, user.getUserID());
        return ResponseEntity.ok(ApiResponse.success("User created successfully", created));
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'AWARD_ORGANIZER')")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable Long userId,
            @RequestBody UserUpdateRequest request,
            @AuthenticationPrincipal User user
    ) {
        UserDTO updated = userService.updateUser(userId, request, user.getUserID());
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal User user
    ) {
        userService.deleteUser(userId, user.getUserID());
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
}
