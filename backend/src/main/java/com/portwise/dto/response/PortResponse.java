package com.portwise.dto.response;

import com.portwise.entity.enums.PortStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class PortResponse {
    private Long id;
    private String name;
    private String code;
    private String location;
    private String state;
    private String country;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer numberOfBerths;
    private PortStatus operationalStatus;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
