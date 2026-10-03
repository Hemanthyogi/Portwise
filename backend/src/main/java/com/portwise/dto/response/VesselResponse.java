package com.portwise.dto.response;

import com.portwise.entity.enums.VesselStatus;
import com.portwise.entity.enums.VesselType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class VesselResponse {
    private Long id;
    private String imoNumber;
    private String name;
    private VesselType vesselType;
    private String flag;
    private BigDecimal deadweightTonnage;
    private BigDecimal lengthOverall;
    private BigDecimal beam;
    private BigDecimal draft;
    private BigDecimal cargoCapacity;
    private String currentLocation;
    private VesselStatus status;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
