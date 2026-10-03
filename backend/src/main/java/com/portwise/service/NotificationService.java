package com.portwise.service;

import com.portwise.dto.response.NotificationResponse;
import com.portwise.dto.response.PageResponse;
import com.portwise.entity.Notification;
import com.portwise.entity.User;
import com.portwise.exception.ResourceNotFoundException;
import com.portwise.repository.NotificationRepository;
import com.portwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createNotification(Long userId, String title, String message) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Notification n = Notification.builder()
            .user(user).title(title).message(message).read(false).build();
        notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getForUser(Long userId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByUserId(userId, pageable);
        var content = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getUser().getId().equals(userId)) {
            throw new com.portwise.exception.ForbiddenException("Not your notification");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
            .id(n.getId())
            .userId(n.getUser().getId())
            .title(n.getTitle())
            .message(n.getMessage())
            .read(n.isRead())
            .relatedEntityType(n.getRelatedEntityType())
            .relatedEntityId(n.getRelatedEntityId())
            .createdAt(n.getCreatedAt())
            .build();
    }
}
