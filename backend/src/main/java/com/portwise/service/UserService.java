package com.portwise.service;

import com.portwise.dto.request.RegisterRequest;
import com.portwise.dto.response.PageResponse;
import com.portwise.dto.response.UserResponse;
import com.portwise.entity.Role;
import com.portwise.entity.User;
import com.portwise.entity.enums.RoleName;
import com.portwise.exception.BadRequestException;
import com.portwise.exception.ConflictException;
import com.portwise.exception.ResourceNotFoundException;
import com.portwise.repository.RoleRepository;
import com.portwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getPaged(String search, Pageable pageable) {
        Page<User> page = (search != null && !search.isBlank())
            ? userRepository.searchActiveUsers(search, pageable)
            : userRepository.findByActiveTrue(pageable);
        var content = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        User user = userRepository.findById(id)
            .filter(User::isActive)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return toResponse(user);
    }

    @Transactional
    public UserResponse create(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email already in use: " + req.getEmail());
        }
        Set<Role> roles = new HashSet<>();
        if (req.getRoles() != null) {
            for (String r : req.getRoles()) {
                RoleName rn = RoleName.valueOf(r.toUpperCase());
                roleRepository.findByName(rn).ifPresent(roles::add);
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
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateRoles(Long id, Set<String> roleNames) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        Set<Role> roles = new HashSet<>();
        for (String r : roleNames) {
            try {
                RoleName rn = RoleName.valueOf(r.toUpperCase());
                roleRepository.findByName(rn).ifPresent(roles::add);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role: " + r);
            }
        }
        user.setRoles(roles);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deactivate(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setActive(false);
        userRepository.save(user);
    }

    public UserResponse toResponse(User u) {
        Set<String> roles = u.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet());
        return UserResponse.builder()
            .id(u.getId()).fullName(u.getFullName()).email(u.getEmail())
            .phone(u.getPhone()).roles(roles).active(u.isActive())
            .createdAt(u.getCreatedAt()).build();
    }
}
