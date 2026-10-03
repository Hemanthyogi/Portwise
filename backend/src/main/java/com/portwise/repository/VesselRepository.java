package com.portwise.repository;

import com.portwise.entity.Vessel;
import com.portwise.entity.enums.VesselStatus;
import com.portwise.entity.enums.VesselType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface VesselRepository extends JpaRepository<Vessel, Long> {
    Optional<Vessel> findByImoNumber(String imoNumber);
    boolean existsByImoNumber(String imoNumber);
    List<Vessel> findByActiveTrue();
    List<Vessel> findByActiveTrueAndStatus(VesselStatus status);
    long countByStatus(VesselStatus status);
    long countByActiveTrueAndStatus(VesselStatus status);

    @Query("SELECT v FROM Vessel v WHERE v.active = true AND " +
           "(LOWER(v.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.imoNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.flag) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Vessel> searchActiveVessels(@Param("search") String search, Pageable pageable);

    Page<Vessel> findByActiveTrue(Pageable pageable);
    Page<Vessel> findByActiveTrueAndStatus(VesselStatus status, Pageable pageable);
    Page<Vessel> findByActiveTrueAndVesselType(VesselType type, Pageable pageable);
}
