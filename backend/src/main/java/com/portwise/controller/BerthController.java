package com.portwise.controller;

import com.portwise.dto.request.BerthRequest;
import com.portwise.dto.response.ApiResponse;
import com.portwise.dto.response.BerthResponse;
import com.portwise.dto.response.PageResponse;
import com.portwise.entity.enums.BerthStatus;
import com.portwise.service.BerthService;
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
@RequestMapping("/api/v1/berths")
@RequiredArgsConstructor
@Tag(name = "Berths", description = "Berth management endpoints")
public class BerthController {

    private final BerthService berthService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BerthResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        var pageable = PageRequest.of(page, size, Sort.by("berthName"));
        return ResponseEntity.ok(ApiResponse.success(berthService.getPaged(search, pageable)));
    }

    @GetMapping("/port/{portId}")
    public ResponseEntity<ApiResponse<List<BerthResponse>>> getByPort(@PathVariable Long portId) {
        return ResponseEntity.ok(ApiResponse.success(berthService.getByPort(portId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BerthResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(berthService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PORT_AUTHORITY')")
    public ResponseEntity<ApiResponse<BerthResponse>> create(@Valid @RequestBody BerthRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Berth created", berthService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PORT_AUTHORITY')")
    public ResponseEntity<ApiResponse<BerthResponse>> update(
            @PathVariable Long id, @Valid @RequestBody BerthRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Berth updated", berthService.update(id, req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','PORT_AUTHORITY')")
    public ResponseEntity<ApiResponse<BerthResponse>> updateStatus(
            @PathVariable Long id, @RequestParam BerthStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Berth status updated", berthService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        berthService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("Berth deactivated", null));
    }
}
