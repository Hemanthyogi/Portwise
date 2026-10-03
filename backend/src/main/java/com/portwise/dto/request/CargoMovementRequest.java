package com.portwise.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CargoMovementRequest {
    @NotNull
    private Long cargoId;
    @NotBlank
    private String status;
    private String location;
    private String remarks;
    @NotNull
    private LocalDateTime timestamp;
}
