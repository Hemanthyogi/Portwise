package com.portwise.dto.response;

import com.portwise.entity.enums.ResourceStatus;
import com.portwise.entity.enums.ResourceType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class ResourceResponse {
    private Long id;
    private String name;
    private ResourceType resourceType;
    private Long portId;
    private String portName;
    private String description;
    private ResourceStatus status;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
