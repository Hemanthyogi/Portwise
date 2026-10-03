package com.portwise.controller;

import com.portwise.dto.request.ShipmentRequest;
import com.portwise.dto.response.ApiResponse;
import com.portwise.dto.response.PageResponse;
import com.portwise.dto.response.ShipmentResponse;
import com.portwise.service.ShipmentService;
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

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
@Tag(name = "Shipments", description = "Shipment tracking endpoints")
public class ShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping
    @Operation(summary = "Get all shipments (paginated)")
    public ResponseEntity<ApiResponse<PageResponse<ShipmentResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(shipmentService.getAll(pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get shipment by ID")
    public ResponseEntity<ApiResponse<ShipmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(shipmentService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SHIPPING_AGENT','CARGO_OWNER')")
    @Operation(summary = "Create shipment")
    public ResponseEntity<ApiResponse<ShipmentResponse>> create(@Valid @RequestBody ShipmentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Shipment created", shipmentService.create(req)));
    }
}
