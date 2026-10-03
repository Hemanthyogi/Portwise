package com.portwise.dto.response;

import com.portwise.entity.enums.AlertSeverity;
import com.portwise.entity.enums.AlertStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class AlertResponse {
    private Long id;
    private String title;
    private String description;
    private AlertSeverity severity;
    private AlertStatus status;
    private String relatedEntityType;
    private Long relatedEntityId;
    private Long portId;
    private String portName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
