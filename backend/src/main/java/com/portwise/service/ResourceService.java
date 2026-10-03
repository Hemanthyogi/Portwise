package com.portwise.service;

import com.portwise.dto.request.ResourceAllocationRequest;
import com.portwise.dto.request.ResourceRequest;
import com.portwise.dto.response.PageResponse;
import com.portwise.dto.response.ResourceAllocationResponse;
import com.portwise.dto.response.ResourceResponse;
import com.portwise.entity.Port;
import com.portwise.entity.Resource;
import com.portwise.entity.ResourceAllocation;
import com.portwise.entity.User;
import com.portwise.entity.enums.AllocationStatus;
import com.portwise.entity.enums.ResourceStatus;
import com.portwise.exception.ConflictException;
import com.portwise.exception.ResourceNotFoundException;
import com.portwise.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceAllocationRepository allocationRepository;
    private final PortRepository portRepository;
    private final UserRepository userRepository;

    @Transactional
    public ResourceResponse create(ResourceRequest req) {
        Port port = portRepository.findById(req.getPortId())
            .orElseThrow(() -> new ResourceNotFoundException("Port not found: " + req.getPortId()));
        Resource resource = Resource.builder()
            .name(req.getName())
            .resourceType(req.getResourceType())
            .port(port)
            .description(req.getDescription())
            .status(ResourceStatus.AVAILABLE)
            .active(true)
            .build();
        return toResponse(resourceRepository.save(resource));
    }

    @Transactional(readOnly = true)
    public ResourceResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<ResourceResponse> getPaged(Pageable pageable) {
        Page<Resource> page = resourceRepository.findByActiveTrue(pageable);
        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> getByPort(Long portId) {
        return resourceRepository.findByPortIdAndActiveTrue(portId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ResourceResponse update(Long id, ResourceRequest req) {
        Resource resource = findById(id);
        Port port = portRepository.findById(req.getPortId())
            .orElseThrow(() -> new ResourceNotFoundException("Port not found"));
        resource.setName(req.getName());
        resource.setResourceType(req.getResourceType());
        resource.setPort(port);
        resource.setDescription(req.getDescription());
        return toResponse(resourceRepository.save(resource));
    }

    @Transactional
    public void deactivate(Long id) {
        Resource r = findById(id);
        r.setActive(false);
        resourceRepository.save(r);
    }

    @Transactional
    public ResourceAllocationResponse allocate(ResourceAllocationRequest req) {
        Resource resource = findById(req.getResourceId());
        if (resource.getStatus() == ResourceStatus.MAINTENANCE ||
            resource.getStatus() == ResourceStatus.OUT_OF_SERVICE) {
            throw new ConflictException("Resource is not available: " + resource.getStatus());
        }

        LocalDateTime end = req.getExpectedCompletion() != null ? req.getExpectedCompletion() :
            req.getStartTime().plusHours(8);

        if (allocationRepository.existsConflict(req.getResourceId(), req.getStartTime(), end, -1L)) {
            throw new ConflictException("Resource has a conflicting allocation in the requested time window");
        }

        User operator = null;
        if (req.getOperatorId() != null) {
            operator = userRepository.findById(req.getOperatorId()).orElse(null);
        }

        ResourceAllocation allocation = ResourceAllocation.builder()
            .resource(resource)
            .operator(operator)
            .operationDescription(req.getOperationDescription())
            .startTime(req.getStartTime())
            .expectedCompletion(end)
            .status(AllocationStatus.PENDING)
            .remarks(req.getRemarks())
            .build();

        resource.setStatus(ResourceStatus.ALLOCATED);
        resourceRepository.save(resource);

        return toAllocationResponse(allocationRepository.save(allocation));
    }

    @Transactional
    public ResourceAllocationResponse completeAllocation(Long id) {
        ResourceAllocation allocation = allocationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Allocation not found: " + id));
        allocation.setStatus(AllocationStatus.COMPLETED);
        allocation.setActualCompletion(LocalDateTime.now());
        Resource resource = allocation.getResource();
        resource.setStatus(ResourceStatus.AVAILABLE);
        resourceRepository.save(resource);
        return toAllocationResponse(allocationRepository.save(allocation));
    }

    @Transactional(readOnly = true)
    public PageResponse<ResourceAllocationResponse> getAllAllocations(Pageable pageable) {
        Page<ResourceAllocation> page = allocationRepository.findAll(pageable);
        var content = page.getContent().stream().map(this::toAllocationResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    private Resource findById(Long id) {
        return resourceRepository.findById(id)
            .filter(Resource::isActive)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
    }

    private PageResponse<ResourceResponse> toPageResponse(Page<Resource> page) {
        var content = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    public ResourceResponse toResponse(Resource r) {
        return ResourceResponse.builder()
            .id(r.getId()).name(r.getName()).resourceType(r.getResourceType())
            .portId(r.getPort().getId()).portName(r.getPort().getName())
            .description(r.getDescription()).status(r.getStatus())
            .active(r.isActive()).createdAt(r.getCreatedAt()).updatedAt(r.getUpdatedAt())
            .build();
    }

    public ResourceAllocationResponse toAllocationResponse(ResourceAllocation a) {
        return ResourceAllocationResponse.builder()
            .id(a.getId())
            .resourceId(a.getResource().getId())
            .resourceName(a.getResource().getName())
            .operatorId(a.getOperator() != null ? a.getOperator().getId() : null)
            .operatorName(a.getOperator() != null ? a.getOperator().getFullName() : null)
            .operationDescription(a.getOperationDescription())
            .startTime(a.getStartTime()).expectedCompletion(a.getExpectedCompletion())
            .actualCompletion(a.getActualCompletion()).status(a.getStatus())
            .remarks(a.getRemarks()).createdAt(a.getCreatedAt()).updatedAt(a.getUpdatedAt())
            .build();
    }
}
