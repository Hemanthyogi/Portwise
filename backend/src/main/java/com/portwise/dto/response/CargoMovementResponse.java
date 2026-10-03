package com.portwise.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class CargoMovementResponse {
    private Long id;
    private Long cargoId;
    private String status;
    private String location;
    private Long operatorId;
    private String operatorName;
    private String remarks;
    private LocalDateTime timestamp;
    private LocalDateTime createdAt;
}
