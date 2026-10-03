package com.portwise.service;

import com.portwise.dto.request.AlertRequest;
import com.portwise.dto.response.AlertResponse;
import com.portwise.dto.response.PageResponse;
import com.portwise.entity.Alert;
import com.portwise.entity.Port;
import com.portwise.entity.enums.AlertSeverity;
import com.portwise.entity.enums.AlertStatus;
import com.portwise.exception.ResourceNotFoundException;
import com.portwise.repository.AlertRepository;
import com.portwise.repository.PortRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final PortRepository portRepository;

    @Transactional
    public AlertResponse create(AlertRequest req) {
        Port port = null;
        if (req.getPortId() != null) {
            port = portRepository.findById(req.getPortId())
                .orElseThrow(() -> new ResourceNotFoundException("Port not found"));
        }
        Alert alert = Alert.builder()
            .title(req.getTitle())
            .description(req.getDescription())
            .severity(req.getSeverity())
            .status(AlertStatus.ACTIVE)
            .relatedEntityType(req.getRelatedEntityType())
            .relatedEntityId(req.getRelatedEntityId())
            .port(port)
            .build();
        return toResponse(alertRepository.save(alert));
    }

    @Transactional
    public AlertResponse createAlert(String title, String description, AlertSeverity severity,
                                     String entityType, Long entityId, Long portId) {
        AlertRequest req = new AlertRequest();
        req.setTitle(title); req.setDescription(description); req.setSeverity(severity);
        req.setRelatedEntityType(entityType); req.setRelatedEntityId(entityId); req.setPortId(portId);
        return create(req);
    }

    @Transactional(readOnly = true)
    public PageResponse<AlertResponse> getAll(Pageable pageable) {
        Page<Alert> page = alertRepository.findAll(pageable);
        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getActiveAlerts() {
        return alertRepository.findByStatusOrderByCreatedAtDesc(AlertStatus.ACTIVE)
            .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public long countActive() {
        return alertRepository.countByStatus(AlertStatus.ACTIVE);
    }

    @Transactional
    public AlertResponse updateStatus(Long id, AlertStatus status) {
        Alert alert = alertRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Alert not found: " + id));
        alert.setStatus(status);
        return toResponse(alertRepository.save(alert));
    }

    private PageResponse<AlertResponse> toPageResponse(Page<Alert> page) {
        var content = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    public AlertResponse toResponse(Alert a) {
        return AlertResponse.builder()
            .id(a.getId())
            .title(a.getTitle())
            .description(a.getDescription())
            .severity(a.getSeverity())
            .status(a.getStatus())
            .relatedEntityType(a.getRelatedEntityType())
            .relatedEntityId(a.getRelatedEntityId())
            .portId(a.getPort() != null ? a.getPort().getId() : null)
            .portName(a.getPort() != null ? a.getPort().getName() : null)
            .createdAt(a.getCreatedAt())
            .updatedAt(a.getUpdatedAt())
            .build();
    }
}
