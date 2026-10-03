package com.portwise.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ResourceAllocationRequest {
    @NotNull
    private Long resourceId;
    private Long operatorId;
    private String operationDescription;
    @NotNull
    private LocalDateTime startTime;
    private LocalDateTime expectedCompletion;
    private String remarks;
}
