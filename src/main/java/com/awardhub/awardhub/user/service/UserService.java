package com.awardhub.awardhub.user.service;

import com.awardhub.awardhub.common.audit.AuditLogService;
import com.awardhub.awardhub.common.exception.BadRequestException;
import com.awardhub.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.awardhub.user.dto.UserCreateRequest;
import com.awardhub.awardhub.user.dto.UserDTO;
import com.awardhub.awardhub.user.dto.UserUpdateRequest;
import com.awardhub.awardhub.user.entity.AccountStatus;
import com.awardhub.awardhub.user.entity.User;
import com.awardhub.awardhub.user.entity.UserRole;
import com.awardhub.awardhub.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return toDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return toDTO(user);
    }

    public UserDTO createUser(UserCreateRequest request, Long adminUserId) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already in use: " + request.getEmail());
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setContactNumber(request.getContactNumber());
        user.setRole(role);
        user.setAccountStatus(AccountStatus.ACTIVE);

        User saved = userRepository.save(user);
        auditLogService.log(adminUserId, "CREATE_USER", "User", saved.getUserID(), 
                           "Created user: " + saved.getEmail() + " with role: " + role);
        
        return toDTO(saved);
    }

    public UserDTO updateUser(Long userId, UserUpdateRequest request, Long updatingUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getContactNumber() != null) {
            user.setContactNumber(request.getContactNumber());
        }

        if (request.getAccountStatus() != null) {
            try {
                user.setAccountStatus(AccountStatus.valueOf(request.getAccountStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid account status: " + request.getAccountStatus());
            }
        }

        User saved = userRepository.save(user);
        auditLogService.log(updatingUserId, "UPDATE_USER", "User", saved.getUserID(), 
                           "Updated user: " + saved.getEmail());
        
        return toDTO(saved);
    }

    public void deleteUser(Long userId, Long adminUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        userRepository.delete(user);
        auditLogService.log(adminUserId, "DELETE_USER", "User", userId, 
                           "Deleted user: " + user.getEmail());
    }

    private UserDTO toDTO(User user) {
        return new UserDTO(user.getUserID(), user.getEmail(), user.getContactNumber(), 
                          user.getRole(), user.getAccountStatus());
    }
}
