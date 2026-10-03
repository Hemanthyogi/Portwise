package com.portwise.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ShipmentRequest {
    @NotBlank
    private String shipmentNumber;
    private Long vesselId;
    private Long originPortId;
    private Long destinationPortId;
    private String consignee;
    private String description;
}
