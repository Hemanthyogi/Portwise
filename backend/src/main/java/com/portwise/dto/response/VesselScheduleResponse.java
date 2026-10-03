package com.portwise.dto.response;

import com.portwise.entity.enums.ScheduleStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class VesselScheduleResponse {
    private Long id;
    private Long vesselId;
    private String vesselName;
    private String vesselImo;
    private Long portId;
    private String portName;
    private Long berthId;
    private String berthName;
    private LocalDateTime eta;
    private LocalDateTime etd;
    private ScheduleStatus status;
    private String remarks;
    private Long submittedById;
    private String submittedByName;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
