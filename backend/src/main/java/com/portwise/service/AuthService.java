package com.portwise.service;

import com.portwise.dto.request.LoginRequest;
import com.portwise.dto.request.RegisterRequest;
import com.portwise.dto.response.AuthResponse;
import com.portwise.dto.response.UserResponse;
import com.portwise.entity.Role;
import com.portwise.entity.User;
import com.portwise.entity.enums.RoleName;
import com.portwise.exception.BadRequestException;
import com.portwise.exception.ConflictException;
import com.portwise.exception.ResourceNotFoundException;
import com.portwise.repository.RoleRepository;
import com.portwise.repository.UserRepository;
import com.portwise.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse login(LoginRequest req) {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        String token = jwtUtils.generateToken(req.getEmail());
        User user = userRepository.findByEmailAndActiveTrue(req.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + req.getEmail()));
        Set<String> roles = user.getRoles().stream()
            .map(r -> r.getName().name()).collect(Collectors.toSet());
        return AuthResponse.builder()
            .token(token).tokenType("Bearer")
            .userId(user.getId()).email(user.getEmail()).fullName(user.getFullName())
            .roles(roles).build();
    }

    @Transactional
    public UserResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email already in use: " + req.getEmail());
        }
        Set<Role> roles = new HashSet<>();
        if (req.getRoles() == null || req.getRoles().isEmpty()) {
            roleRepository.findByName(RoleName.SHIPPING_AGENT).ifPresent(roles::add);
        } else {
            for (String roleName : req.getRoles()) {
                try {
                    RoleName rn = RoleName.valueOf(roleName.toUpperCase());
                    roleRepository.findByName(rn).ifPresent(roles::add);
                } catch (IllegalArgumentException e) {
                    throw new BadRequestException("Unknown role: " + roleName);
                }
            }
        }
        User user = User.builder()
            .fullName(req.getFullName())
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .phone(req.getPhone())
            .roles(roles)
            .active(true)
            .build();
        User saved = userRepository.save(user);
        return toUserResponse(saved);
    }

    @Transactional(readOnly = true)
    public UserResponse getMe(String email) {
        User user = userRepository.findByEmailAndActiveTrue(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return toUserResponse(user);
    }

    public UserResponse toUserResponse(User u) {
        Set<String> roles = u.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet());
        return UserResponse.builder()
            .id(u.getId()).fullName(u.getFullName()).email(u.getEmail())
            .phone(u.getPhone()).roles(roles).active(u.isActive())
            .createdAt(u.getCreatedAt()).build();
    }
}
