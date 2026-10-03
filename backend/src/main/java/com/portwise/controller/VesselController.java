package com.portwise.controller;

import com.portwise.dto.request.VesselRequest;
import com.portwise.dto.response.ApiResponse;
import com.portwise.dto.response.PageResponse;
import com.portwise.dto.response.VesselResponse;
import com.portwise.entity.enums.VesselStatus;
import com.portwise.service.VesselService;
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
@RequestMapping("/api/v1/vessels")
@RequiredArgsConstructor
@Tag(name = "Vessels", description = "Vessel management endpoints")
public class VesselController {

    private final VesselService vesselService;

    @GetMapping
    @Operation(summary = "Get all vessels (paginated, with optional search/filter)")
    public ResponseEntity<ApiResponse<PageResponse<VesselResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) VesselStatus status) {
        var pageable = PageRequest.of(page, size, Sort.by("name"));
        return ResponseEntity.ok(ApiResponse.success(vesselService.getPaged(search, status, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VesselResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(vesselService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SHIPPING_AGENT')")
    public ResponseEntity<ApiResponse<VesselResponse>> create(@Valid @RequestBody VesselRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Vessel created", vesselService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SHIPPING_AGENT')")
    public ResponseEntity<ApiResponse<VesselResponse>> update(
            @PathVariable Long id, @Valid @RequestBody VesselRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Vessel updated", vesselService.update(id, req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','PORT_AUTHORITY','SHIPPING_AGENT')")
    public ResponseEntity<ApiResponse<VesselResponse>> updateStatus(
            @PathVariable Long id, @RequestParam VesselStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", vesselService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        vesselService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("Vessel deactivated", null));
    }
}
