package com.portwise.controller;

import com.portwise.dto.request.ResourceRequest;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
@Tag(name = "Resources", description = "Resource management")
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ResourceResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by("name"));
        return ResponseEntity.ok(ApiResponse.success(resourceService.getPaged(pageable)));
    }

    @GetMapping("/port/{portId}")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> getByPort(@PathVariable Long portId) {
        return ResponseEntity.ok(ApiResponse.success(resourceService.getByPort(portId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(resourceService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PORT_AUTHORITY')")
    public ResponseEntity<ApiResponse<ResourceResponse>> create(@Valid @RequestBody ResourceRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Resource created", resourceService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PORT_AUTHORITY')")
    public ResponseEntity<ApiResponse<ResourceResponse>> update(
            @PathVariable Long id, @Valid @RequestBody ResourceRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Resource updated", resourceService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        resourceService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("Resource deactivated", null));
    }
}
