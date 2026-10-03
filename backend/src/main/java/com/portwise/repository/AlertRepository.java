package com.portwise.repository;

import com.portwise.entity.Alert;
import com.portwise.entity.enums.AlertStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByStatusOrderByCreatedAtDesc(AlertStatus status);
    Page<Alert> findAll(Pageable pageable);
    Page<Alert> findByStatus(AlertStatus status, Pageable pageable);
    long countByStatus(AlertStatus status);
}
