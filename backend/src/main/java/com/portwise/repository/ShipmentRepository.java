package com.portwise.repository;

import com.portwise.entity.Shipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByShipmentNumber(String shipmentNumber);
    boolean existsByShipmentNumber(String shipmentNumber);
    Page<Shipment> findAll(Pageable pageable);
}
