package com.portwise.controller;

import com.portwise.dto.response.ApiResponse;
import com.portwise.dto.response.ReportResponse;
import com.portwise.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Operational reporting and analytics")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/operational")
    @PreAuthorize("hasAnyRole('ADMIN','PORT_AUTHORITY')")
    @Operation(summary = "Get comprehensive operational port report")
    public ResponseEntity<ApiResponse<ReportResponse>> getOperationalReport() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getOperationalReport()));
    }
}
