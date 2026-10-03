package com.portwise.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data @Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Set<String> roles;
    private boolean active;
    private LocalDateTime createdAt;
}
