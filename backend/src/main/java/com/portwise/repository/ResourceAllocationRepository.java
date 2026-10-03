package com.portwise.repository;

import com.portwise.entity.ResourceAllocation;
import com.portwise.entity.enums.AllocationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

public interface ResourceAllocationRepository extends JpaRepository<ResourceAllocation, Long> {
    Page<ResourceAllocation> findByOperatorId(Long operatorId, Pageable pageable);
    Page<ResourceAllocation> findAll(Pageable pageable);

    /** Conflict: same resource, overlapping active window */
    @Query("SELECT COUNT(a) > 0 FROM ResourceAllocation a " +
           "WHERE a.resource.id = :resourceId " +
           "AND a.id <> :excludeId " +
           "AND a.status IN ('PENDING','ACTIVE') " +
           "AND a.startTime < :end AND a.expectedCompletion > :start")
    boolean existsConflict(
        @Param("resourceId") Long resourceId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end,
        @Param("excludeId") Long excludeId);
}
