package com.portwise.controller;

import com.portwise.dto.request.ResourceAllocationRequest;
import com.portwise.dto.response.*;
import com.portwise.service.ResourceService;
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
@RequestMapping("/api/v1/resource-allocations")
@RequiredArgsConstructor
@Tag(name = "Resource Allocations", description = "Resource allocation management")
public class ResourceAllocationController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ResourceAllocationResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(resourceService.getAllAllocations(pageable)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PORT_AUTHORITY')")
    public ResponseEntity<ApiResponse<ResourceAllocationResponse>> allocate(
            @Valid @RequestBody ResourceAllocationRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Resource allocated", resourceService.allocate(req)));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN','PORT_AUTHORITY','LOGISTICS_OPERATOR')")
    public ResponseEntity<ApiResponse<ResourceAllocationResponse>> complete(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Allocation completed", resourceService.completeAllocation(id)));
    }
}
