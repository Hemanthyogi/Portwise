package com.portwise.repository;

import com.portwise.entity.CargoMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CargoMovementRepository extends JpaRepository<CargoMovement, Long> {
    List<CargoMovement> findByCargoIdOrderByTimestampAsc(Long cargoId);
}
