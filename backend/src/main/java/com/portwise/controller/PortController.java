package com.portwise.controller;

import com.portwise.dto.request.PortRequest;
import com.portwise.dto.response.ApiResponse;
import com.portwise.dto.response.PageResponse;
import com.portwise.dto.response.PortResponse;
import com.portwise.service.PortService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/v1/ports")
@RequiredArgsConstructor
@Tag(name = "Ports", description = "Port management endpoints")
public class PortController {

    private final PortService portService;

    @GetMapping
    @Operation(summary = "Get all ports (paginated)")
    public ResponseEntity<ApiResponse<PageResponse<PortResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        var pageable = PageRequest.of(page, size, Sort.by("name"));
        return ResponseEntity.ok(ApiResponse.success(portService.getPaged(search, pageable)));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all active ports (list)")
    public ResponseEntity<ApiResponse<List<PortResponse>>> getAllList() {
        return ResponseEntity.ok(ApiResponse.success(portService.getAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get port by ID")
    public ResponseEntity<ApiResponse<PortResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(portService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new port")
    public ResponseEntity<ApiResponse<PortResponse>> create(@Valid @RequestBody PortRequest req) {
        PortResponse resp = portService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Port created successfully", resp));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a port")
    public ResponseEntity<ApiResponse<PortResponse>> update(
            @PathVariable Long id, @Valid @RequestBody PortRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Port updated", portService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate a port")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        portService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("Port deactivated", null));
    }
}
