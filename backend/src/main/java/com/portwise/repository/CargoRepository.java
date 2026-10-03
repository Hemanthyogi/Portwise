package com.portwise.repository;

import com.portwise.entity.Cargo;
import com.portwise.entity.enums.CargoStatus;
import com.portwise.entity.enums.CargoType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CargoRepository extends JpaRepository<Cargo, Long> {
    Page<Cargo> findByOwnerId(Long ownerId, Pageable pageable);
    List<Cargo> findByShipmentId(Long shipmentId);
    long countByStatus(CargoStatus status);

    @Query("SELECT c FROM Cargo c WHERE " +
           "(LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.consignee) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.origin) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Cargo> searchCargo(@Param("search") String search, Pageable pageable);

    Page<Cargo> findAll(Pageable pageable);
    Page<Cargo> findByStatus(CargoStatus status, Pageable pageable);
    Page<Cargo> findByCargoType(CargoType type, Pageable pageable);
}
