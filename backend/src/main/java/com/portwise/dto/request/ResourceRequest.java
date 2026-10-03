package com.portwise.dto.request;

import com.portwise.entity.enums.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResourceRequest {
    @NotBlank
    private String name;
    @NotNull
    private ResourceType resourceType;
    @NotNull
    private Long portId;
    private String description;
}
