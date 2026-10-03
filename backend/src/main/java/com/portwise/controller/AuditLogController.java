package com.portwise.controller;

import com.portwise.dto.response.ApiResponse;
import com.portwise.dto.response.AuditLogResponse;
import com.portwise.dto.response.PageResponse;
import com.portwise.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Get audit logs (Admin only)")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String entityType) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var result = (entityType != null && !entityType.isBlank())
            ? auditLogService.getByEntityType(entityType, pageable)
            : auditLogService.getAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
