package com.portwise.service;

import com.portwise.dto.response.DashboardResponse;
import com.portwise.entity.enums.*;
import com.portwise.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VesselRepository vesselRepository;
    private final VesselScheduleRepository scheduleRepository;
    private final CargoRepository cargoRepository;
    private final BerthRepository berthRepository;
    private final AlertRepository alertRepository;
    private final VesselScheduleService scheduleService;
    private final AlertService alertService;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        // Vessel KPIs
        long totalVessels = vesselRepository.countByActiveTrueAndStatus(VesselStatus.SCHEDULED)
            + vesselRepository.countByActiveTrueAndStatus(VesselStatus.ARRIVING)
            + vesselRepository.countByActiveTrueAndStatus(VesselStatus.AT_BERTH)
            + vesselRepository.countByActiveTrueAndStatus(VesselStatus.AT_ANCHORAGE)
            + vesselRepository.countByActiveTrueAndStatus(VesselStatus.LOADING)
            + vesselRepository.countByActiveTrueAndStatus(VesselStatus.UNLOADING);
        long arrivingVessels = vesselRepository.countByActiveTrueAndStatus(VesselStatus.ARRIVING);
        long atBerthVessels = vesselRepository.countByActiveTrueAndStatus(VesselStatus.AT_BERTH)
            + vesselRepository.countByActiveTrueAndStatus(VesselStatus.LOADING)
            + vesselRepository.countByActiveTrueAndStatus(VesselStatus.UNLOADING);

        // Cargo KPIs
        long cargoInTransit = cargoRepository.countByStatus(CargoStatus.IN_TRANSIT);
        long cargoCompleted = cargoRepository.countByStatus(CargoStatus.COMPLETED);

        // Berth KPIs
        long berthsOccupied = berthRepository.countByStatus(BerthStatus.OCCUPIED)
            + berthRepository.countByStatus(BerthStatus.RESERVED);
        long berthsAvailable = berthRepository.countByStatus(BerthStatus.AVAILABLE);

        // Schedule + Alert KPIs
        long pendingSchedules = scheduleRepository.countByStatus(ScheduleStatus.PENDING);
        long activeAlerts = alertRepository.countByStatus(AlertStatus.ACTIVE);

        // Vessel status distribution
        Map<String, Long> vesselDist = new LinkedHashMap<>();
        for (VesselStatus s : VesselStatus.values()) {
            long count = vesselRepository.countByStatus(s);
            if (count > 0) vesselDist.put(s.name(), count);
        }

        // Cargo status distribution
        Map<String, Long> cargoDist = new LinkedHashMap<>();
        for (CargoStatus s : CargoStatus.values()) {
            long count = cargoRepository.countByStatus(s);
            if (count > 0) cargoDist.put(s.name(), count);
        }

        // Recent schedules
        var recentSchedules = scheduleRepository
            .findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt")))
            .getContent().stream().map(scheduleService::toResponse).toList();

        // Recent active alerts
        var recentAlerts = alertService.getActiveAlerts().stream().limit(5).toList();

        return DashboardResponse.builder()
            .totalVessels(totalVessels)
            .activeVessels(totalVessels)
            .arrivingVessels(arrivingVessels)
            .atBerthVessels(atBerthVessels)
            .cargoInTransit(cargoInTransit)
            .cargoCompleted(cargoCompleted)
            .berthsOccupied(berthsOccupied)
            .berthsAvailable(berthsAvailable)
            .pendingSchedules(pendingSchedules)
            .activeAlerts(activeAlerts)
            .recentSchedules(recentSchedules)
            .recentAlerts(recentAlerts)
            .vesselStatusDistribution(vesselDist)
            .cargoStatusDistribution(cargoDist)
            .build();
    }
}
