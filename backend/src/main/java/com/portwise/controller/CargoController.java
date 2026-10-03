package com.portwise.controller;

import com.portwise.dto.request.CargoMovementRequest;
import com.portwise.dto.request.CargoRequest;
import com.portwise.dto.response.*;
import com.portwise.entity.enums.CargoStatus;
import com.portwise.service.CargoService;
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
@RequestMapping("/api/v1/cargo")
@RequiredArgsConstructor
@Tag(name = "Cargo", description = "Cargo management and tracking")
public class CargoController {

    private final CargoService cargoService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CargoResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) CargoStatus status) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(cargoService.getPaged(search, status, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CargoResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(cargoService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','CARGO_OWNER','SHIPPING_AGENT')")
    public ResponseEntity<ApiResponse<CargoResponse>> create(@Valid @RequestBody CargoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Cargo registered", cargoService.create(req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','PORT_AUTHORITY','LOGISTICS_OPERATOR')")
    public ResponseEntity<ApiResponse<CargoResponse>> updateStatus(
            @PathVariable Long id, @RequestParam CargoStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", cargoService.updateStatus(id, status)));
    }

    @GetMapping("/{id}/movements")
    public ResponseEntity<ApiResponse<List<CargoMovementResponse>>> getMovements(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(cargoService.getMovements(id)));
    }

    @PostMapping("/movements")
    @PreAuthorize("hasAnyRole('ADMIN','PORT_AUTHORITY','LOGISTICS_OPERATOR')")
    public ResponseEntity<ApiResponse<CargoMovementResponse>> addMovement(
            @Valid @RequestBody CargoMovementRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Movement added", cargoService.addMovement(req)));
    }
}
