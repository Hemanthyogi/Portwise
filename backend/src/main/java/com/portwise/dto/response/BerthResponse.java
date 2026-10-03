package com.portwise.dto.response;

import com.portwise.entity.enums.BerthStatus;
import com.portwise.entity.enums.CargoType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class BerthResponse {
    private Long id;
    private Long portId;
    private String portName;
    private String berthName;
    private String berthType;
    private BigDecimal maxDraft;
    private BigDecimal maxLOA;
    private CargoType cargoType;
    private BerthStatus status;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
