package com.portwise.repository;

import com.portwise.entity.Port;
import com.portwise.entity.enums.PortStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface PortRepository extends JpaRepository<Port, Long> {
    Optional<Port> findByCode(String code);
    boolean existsByCode(String code);
    List<Port> findByActiveTrue();

    @Query("SELECT p FROM Port p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.state) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Port> searchActivePorts(@Param("search") String search, Pageable pageable);

    Page<Port> findByActiveTrue(Pageable pageable);
    Page<Port> findByActiveTrueAndOperationalStatus(PortStatus status, Pageable pageable);
    long countByActiveTrue();
}
