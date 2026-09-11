package com.awardhub.awardhub.user;

import com.awardhub.awardhub.common.exception.BadRequestException;
import com.awardhub.awardhub.user.dto.UserCreateRequest;
import com.awardhub.awardhub.user.dto.UserDTO;
import com.awardhub.awardhub.user.dto.UserUpdateRequest;
import com.awardhub.awardhub.user.entity.AccountStatus;
import com.awardhub.awardhub.user.entity.User;
import com.awardhub.awardhub.user.entity.UserRole;
import com.awardhub.awardhub.user.repository.UserRepository;
import com.awardhub.awardhub.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class UserManagementIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    private User adminUser;

    @BeforeEach
    public void setUp() {
        adminUser = new User();
        adminUser.setEmail("admin@test.com");
        adminUser.setPassword("password123");
        adminUser.setContactNumber("1234567890");
        adminUser.setRole(UserRole.SYSTEM_ADMINISTRATOR);
        adminUser.setAccountStatus(AccountStatus.ACTIVE);
        adminUser = userRepository.save(adminUser);
    }

    @Test
    public void testCreateUserSuccessfully() {
        // Arrange
        UserCreateRequest request = new UserCreateRequest(
            "newuser@test.com",
            "Password123",
            "5555555555",
            "JUDGE"
        );

        // Act
        UserDTO created = userService.createUser(request, adminUser.getUserID());

        // Assert
        assertNotNull(created);
        assertNotNull(created.getUserID());
        assertEquals("newuser@test.com", created.getEmail());
        assertEquals(UserRole.JUDGE, created.getRole());
        assertEquals(AccountStatus.ACTIVE, created.getAccountStatus());

        // Verify user is saved
        User saved = userRepository.findById(created.getUserID()).get();
        assertNotNull(saved);
    }

    @Test
    public void testCreateUserWithDuplicateEmailFails() {
        // Arrange
        UserCreateRequest request = new UserCreateRequest(
            "admin@test.com",
            "Password123",
            "5555555555",
            "VOTER"
        );

        // Act & Assert
        assertThrows(BadRequestException.class, () ->
            userService.createUser(request, adminUser.getUserID())
        );
    }

    @Test
    public void testUpdateUserSuccessfully() {
        // Arrange
        User testUser = new User();
        testUser.setEmail("testuser@test.com");
        testUser.setPassword("password123");
        testUser.setContactNumber("1111111111");
        testUser.setAccountStatus(AccountStatus.ACTIVE);
        testUser = userRepository.save(testUser);

        UserUpdateRequest updateRequest = new UserUpdateRequest(
            "9999999999",
            "PENDING_VERIFICATION"
        );

        // Act
        UserDTO updated = userService.updateUser(testUser.getUserID(), updateRequest, adminUser.getUserID());

        // Assert
        assertNotNull(updated);
        assertEquals("9999999999", updated.getContactNumber());
        assertEquals(AccountStatus.PENDING_VERIFICATION, updated.getAccountStatus());
    }

    @Test
    public void testDeleteUserSuccessfully() {
        // Arrange
        User testUser = new User();
        testUser.setEmail("deleteuser@test.com");
        testUser.setPassword("password123");
        testUser.setContactNumber("2222222222");
        testUser = userRepository.save(testUser);
        Long userId = testUser.getUserID();

        // Act
        userService.deleteUser(userId, adminUser.getUserID());

        // Assert
        assertFalse(userRepository.findById(userId).isPresent());
    }

    @Test
    public void testGetUserById() {
        // Arrange
        User testUser = new User();
        testUser.setEmail("getuser@test.com");
        testUser.setPassword("password123");
        testUser.setContactNumber("3333333333");
        testUser = userRepository.save(testUser);

        // Act
        UserDTO retrieved = userService.getUserById(testUser.getUserID());

        // Assert
        assertNotNull(retrieved);
        assertEquals(testUser.getUserID(), retrieved.getUserID());
        assertEquals("getuser@test.com", retrieved.getEmail());
    }

    @Test
    public void testGetUserByEmail() {
        // Arrange
        User testUser = new User();
        testUser.setEmail("emailuser@test.com");
        testUser.setPassword("password123");
        testUser.setContactNumber("4444444444");
        testUser = userRepository.save(testUser);

        // Act
        UserDTO retrieved = userService.getUserByEmail("emailuser@test.com");

        // Assert
        assertNotNull(retrieved);
        assertEquals("emailuser@test.com", retrieved.getEmail());
    }

    @Test
    public void testGetAllUsers() {
        // Arrange
        for (int i = 0; i < 5; i++) {
            User user = new User();
            user.setEmail("user" + i + "@test.com");
            user.setPassword("password123");
            user.setContactNumber("000000000" + i);
            userRepository.save(user);
        }

        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<UserDTO> page = userService.getAllUsers(pageable);

        // Assert
        assertTrue(page.getTotalElements() >= 5);
    }

    @Test
    public void testGetUsersByRole() {
        // Arrange - create judge users
        for (int i = 0; i < 3; i++) {
            User judge = new User();
            judge.setEmail("judge" + i + "@test.com");
            judge.setPassword("password123");
            judge.setContactNumber("777777777" + i);
            judge.setRole(UserRole.JUDGE);
            userRepository.save(judge);
        }

        // Act
        List<UserDTO> judges = userService.getUsersByRole(UserRole.JUDGE);

        // Assert
        assertEquals(3, judges.size());
        assertTrue(judges.stream().allMatch(j -> j.getRole() == UserRole.JUDGE));
    }
}
