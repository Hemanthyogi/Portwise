package com.portwise.controller;

import com.portwise.dto.request.ScheduleStatusRequest;
import com.portwise.dto.request.VesselScheduleRequest;
import com.portwise.dto.response.ApiResponse;
import com.portwise.dto.response.PageResponse;
import com.portwise.dto.response.VesselScheduleResponse;
import com.portwise.entity.enums.ScheduleStatus;
import com.portwise.service.VesselScheduleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
@Tag(name = "Vessel Schedules", description = "Scheduling endpoints")
public class VesselScheduleController {

    private final VesselScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<VesselScheduleResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) ScheduleStatus status) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var result = (status != null)
            ? scheduleService.getByStatus(status, pageable)
            : scheduleService.getAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VesselScheduleResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SHIPPING_AGENT')")
    public ResponseEntity<ApiResponse<VesselScheduleResponse>> create(
            @Valid @RequestBody VesselScheduleRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Schedule submitted", scheduleService.create(req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','PORT_AUTHORITY')")
    public ResponseEntity<ApiResponse<VesselScheduleResponse>> updateStatus(
            @PathVariable Long id, @Valid @RequestBody ScheduleStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", scheduleService.updateStatus(id, req)));
    }
}
