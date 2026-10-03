package com.portwise.repository;

import com.portwise.entity.VesselSchedule;
import com.portwise.entity.enums.ScheduleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface VesselScheduleRepository extends JpaRepository<VesselSchedule, Long> {
    List<VesselSchedule> findByVesselId(Long vesselId);
    Page<VesselSchedule> findByVesselId(Long vesselId, Pageable pageable);
    Page<VesselSchedule> findByPortId(Long portId, Pageable pageable);
    Page<VesselSchedule> findByStatus(ScheduleStatus status, Pageable pageable);
    long countByStatus(ScheduleStatus status);

    /** Conflict detection: same berth, overlapping time window, different schedule id */
    @Query("SELECT COUNT(s) > 0 FROM VesselSchedule s " +
           "WHERE s.berth.id = :berthId " +
           "AND s.id <> :excludeId " +
           "AND s.status NOT IN ('REJECTED','CANCELLED','COMPLETED') " +
           "AND s.eta < :etd AND s.etd > :eta")
    boolean existsBerthConflict(
        @Param("berthId") Long berthId,
        @Param("eta") LocalDateTime eta,
        @Param("etd") LocalDateTime etd,
        @Param("excludeId") Long excludeId);

    Page<VesselSchedule> findAll(Pageable pageable);
    List<VesselSchedule> findByBerthId(Long berthId);
}
