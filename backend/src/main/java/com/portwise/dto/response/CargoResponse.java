package com.portwise.dto.response;

import com.portwise.entity.enums.CargoStatus;
import com.portwise.entity.enums.CargoType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class CargoResponse {
    private Long id;
    private CargoType cargoType;
    private String description;
    private BigDecimal quantity;
    private String unit;
    private String origin;
    private String destination;
    private String consignee;
    private Long shipmentId;
    private String shipmentNumber;
    private Long ownerId;
    private String ownerName;
    private CargoStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
