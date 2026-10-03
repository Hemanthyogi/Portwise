package com.portwise.dto.request;

import com.portwise.entity.enums.ScheduleStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ScheduleStatusRequest {
    @NotNull
    private ScheduleStatus status;
    private String remarks;
    private Long berthId;
}
