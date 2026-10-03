package com.portwise.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.Set;

@Data
public class RegisterRequest {
    @NotBlank @Size(min=2, max=100)
    private String fullName;
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min=8)
    private String password;
    private String phone;
    private Set<String> roles;
}
