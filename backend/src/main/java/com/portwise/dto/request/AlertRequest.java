package com.portwise.dto.request;

import com.portwise.entity.enums.AlertSeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AlertRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String description;
    @NotNull
    private AlertSeverity severity;
    private String relatedEntityType;
    private Long relatedEntityId;
    private Long portId;
}
