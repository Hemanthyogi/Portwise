package com.portwise;

import com.portwise.dto.request.LoginRequest;
import com.portwise.dto.request.RegisterRequest;
import com.portwise.dto.response.AuthResponse;
import com.portwise.dto.response.UserResponse;
import com.portwise.entity.Role;
import com.portwise.entity.User;
import com.portwise.entity.enums.RoleName;
import com.portwise.exception.ConflictException;
import com.portwise.repository.RoleRepository;
import com.portwise.repository.UserRepository;
import com.portwise.security.JwtUtils;
import com.portwise.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authManager;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private Role agentRole;

    @BeforeEach
    void setUp() {
        agentRole = Role.builder().id(1L).name(RoleName.SHIPPING_AGENT).build();
        testUser = User.builder()
            .id(1L)
            .email("agent@portwise.demo")
            .fullName("Demo Agent")
            .password("hashedPassword")
            .active(true)
            .roles(Set.of(agentRole))
            .build();
    }

    @Test
    @DisplayName("Should successfully authenticate and return JWT token")
    void testLoginSuccess() {
        LoginRequest req = new LoginRequest();
        req.setEmail("agent@portwise.demo");
        req.setPassword("Demo@12345");

        when(userRepository.findByEmailAndActiveTrue(req.getEmail())).thenReturn(Optional.of(testUser));
        when(jwtUtils.generateToken(req.getEmail())).thenReturn("mock.jwt.token");

        AuthResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals("mock.jwt.token", resp.getToken());
        assertEquals("Bearer", resp.getTokenType());
        assertEquals("agent@portwise.demo", resp.getEmail());
        assertTrue(resp.getRoles().contains("SHIPPING_AGENT"));
    }

    @Test
    @DisplayName("Should register new user and encode password")
    void testRegisterSuccess() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("newuser@portwise.demo");
        req.setFullName("New User");
        req.setPassword("Password123");
        req.setRoles(Set.of("SHIPPING_AGENT"));

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(false);
        when(roleRepository.findByName(RoleName.SHIPPING_AGENT)).thenReturn(Optional.of(agentRole));
        when(passwordEncoder.encode(req.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserResponse resp = authService.register(req);

        assertNotNull(resp);
        verify(passwordEncoder).encode("Password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw ConflictException when registering with duplicate email")
    void testRegisterDuplicateEmail() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("agent@portwise.demo");
        req.setFullName("Demo Agent");
        req.setPassword("Password123");

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any(User.class));
    }
}
