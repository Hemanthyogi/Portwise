package com.portwise.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class VesselScheduleRequest {
    @NotNull
    private Long vesselId;
    @NotNull
    private Long portId;
    private Long berthId;
    @NotNull @Future
    private LocalDateTime eta;
    @NotNull @Future
    private LocalDateTime etd;
    private String remarks;
}
