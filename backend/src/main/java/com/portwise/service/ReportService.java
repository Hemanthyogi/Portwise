package com.portwise.service;

import com.portwise.dto.response.ReportResponse;
import com.portwise.entity.enums.BerthStatus;
import com.portwise.entity.enums.CargoType;
import com.portwise.entity.enums.VesselType;
import com.portwise.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final VesselRepository vesselRepository;
    private final CargoRepository cargoRepository;
    private final BerthRepository berthRepository;
    private final VesselScheduleRepository scheduleRepository;

    @Transactional(readOnly = true)
    public ReportResponse getOperationalReport() {
        long totalVessels = vesselRepository.count();
        long totalCargo = cargoRepository.count();

        // Calculate total cargo quantity
        BigDecimal totalQty = cargoRepository.findAll().stream()
            .map(c -> c.getQuantity() != null ? c.getQuantity() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Berth utilization
        long totalBerths = berthRepository.count();
        long occupiedBerths = berthRepository.countByStatus(BerthStatus.OCCUPIED)
            + berthRepository.countByStatus(BerthStatus.RESERVED);
        double utilization = totalBerths > 0 ? ((double) occupiedBerths / totalBerths) * 100.0 : 0.0;

        // Traffic by type
        Map<String, Long> trafficByType = new LinkedHashMap<>();
        for (VesselType vt : VesselType.values()) {
            long count = vesselRepository.findAll().stream()
                .filter(v -> v.getVesselType() == vt).count();
            if (count > 0) trafficByType.put(vt.name(), count);
        }

        // Cargo by type
        Map<String, Long> cargoByType = new LinkedHashMap<>();
        for (CargoType ct : CargoType.values()) {
            long count = cargoRepository.findAll().stream()
                .filter(c -> c.getCargoType() == ct).count();
            if (count > 0) cargoByType.put(ct.name(), count);
        }

        // Monthly throughput mock series based on real total
        List<Map<String, Object>> throughput = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"};
        double base = totalQty.doubleValue() > 0 ? totalQty.doubleValue() / 10.0 : 15000.0;
        for (int i = 0; i < months.length; i++) {
            Map<String, Object> point = new HashMap<>();
            point.put("month", months[i]);
            point.put("throughput", Math.round(base * (0.8 + 0.4 * (i % 3))));
            throughput.add(point);
        }

        return ReportResponse.builder()
            .reportType("COMPREHENSIVE_PORT_ANALYTICS")
            .totalVessels(totalVessels)
            .totalCargoOperations(totalCargo)
            .totalCargoQuantity(totalQty)
            .berthUtilizationPercentage(Math.round(utilization * 10.0) / 10.0)
            .averageTurnaroundHours(34.5)
            .trafficByType(trafficByType)
            .cargoByType(cargoByType)
            .monthlyThroughput(throughput)
            .build();
    }
}
