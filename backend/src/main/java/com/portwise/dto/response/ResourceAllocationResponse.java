package com.portwise.dto.response;

import com.portwise.entity.enums.AllocationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class ResourceAllocationResponse {
    private Long id;
    private Long resourceId;
    private String resourceName;
    private Long operatorId;
    private String operatorName;
    private String operationDescription;
    private LocalDateTime startTime;
    private LocalDateTime expectedCompletion;
    private LocalDateTime actualCompletion;
    private AllocationStatus status;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
