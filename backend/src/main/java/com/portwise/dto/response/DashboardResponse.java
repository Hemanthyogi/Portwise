package com.portwise.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data @Builder
public class DashboardResponse {
    // KPI counts
    private long totalVessels;
    private long activeVessels;
    private long arrivingVessels;
    private long atBerthVessels;
    private long cargoInTransit;
    private long cargoCompleted;
    private long berthsOccupied;
    private long berthsAvailable;
    private long pendingSchedules;
    private long activeAlerts;
    // Recent data
    private List<VesselScheduleResponse> recentSchedules;
    private List<AlertResponse> recentAlerts;
    // Chart data
    private Map<String, Long> vesselStatusDistribution;
    private Map<String, Long> cargoStatusDistribution;
}
