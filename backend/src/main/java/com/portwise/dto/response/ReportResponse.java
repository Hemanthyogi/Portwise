package com.portwise.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder
public class ReportResponse {
    private String reportType;
    private long totalVessels;
    private long totalCargoOperations;
    private BigDecimal totalCargoQuantity;
    private double berthUtilizationPercentage;
    private double averageTurnaroundHours;
    private Map<String, Long> trafficByType;
    private Map<String, Long> cargoByType;
    private List<Map<String, Object>> monthlyThroughput;
}
