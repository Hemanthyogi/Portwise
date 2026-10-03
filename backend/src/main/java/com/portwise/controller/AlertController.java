package com.portwise.controller;

import com.portwise.dto.request.AlertRequest;
import com.portwise.dto.response.AlertResponse;
import com.portwise.dto.response.ApiResponse;
import com.portwise.dto.response.PageResponse;
import com.portwise.entity.enums.AlertStatus;
import com.portwise.service.AlertService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Alerts", description = "Alert management")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AlertResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(alertService.getAll(pageable)));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getActive() {
        return ResponseEntity.ok(ApiResponse.success(alertService.getActiveAlerts()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PORT_AUTHORITY')")
    public ResponseEntity<ApiResponse<AlertResponse>> create(@Valid @RequestBody AlertRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Alert created", alertService.create(req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','PORT_AUTHORITY')")
    public ResponseEntity<ApiResponse<AlertResponse>> updateStatus(
            @PathVariable Long id, @RequestParam AlertStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Alert status updated", alertService.updateStatus(id, status)));
    }
}
