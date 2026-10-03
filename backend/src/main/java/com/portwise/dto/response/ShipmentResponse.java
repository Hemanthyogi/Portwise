package com.portwise.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class ShipmentResponse {
    private Long id;
    private String shipmentNumber;
    private Long vesselId;
    private String vesselName;
    private Long originPortId;
    private String originPortName;
    private Long destinationPortId;
    private String destinationPortName;
    private String consignee;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
