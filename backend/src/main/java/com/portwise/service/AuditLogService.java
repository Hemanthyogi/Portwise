package com.portwise.service;

import com.portwise.dto.response.AuditLogResponse;
import com.portwise.dto.response.PageResponse;
import com.portwise.entity.AuditLog;
import com.portwise.entity.User;
import com.portwise.repository.AuditLogRepository;
import com.portwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void log(String userEmail, String action, String entityType, Long entityId, String details) {
        User user = null;
        if (userEmail != null) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }
        AuditLog log = AuditLog.builder()
            .user(user)
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .details(details)
            .build();
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAll(Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.findAll(pageable);
        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getByUser(Long userId, Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.findByUserId(userId, pageable);
        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getByEntityType(String entityType, Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.findByEntityType(entityType, pageable);
        return toPageResponse(page);
    }

    private PageResponse<AuditLogResponse> toPageResponse(Page<AuditLog> page) {
        var content = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return AuditLogResponse.builder()
            .id(log.getId())
            .userId(log.getUser() != null ? log.getUser().getId() : null)
            .userEmail(log.getUser() != null ? log.getUser().getEmail() : null)
            .action(log.getAction())
            .entityType(log.getEntityType())
            .entityId(log.getEntityId())
            .details(log.getDetails())
            .ipAddress(log.getIpAddress())
            .createdAt(log.getCreatedAt())
            .build();
    }
}
