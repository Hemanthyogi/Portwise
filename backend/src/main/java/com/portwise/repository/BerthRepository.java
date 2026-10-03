package com.portwise.repository;

import com.portwise.entity.Berth;
import com.portwise.entity.enums.BerthStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface BerthRepository extends JpaRepository<Berth, Long> {
    List<Berth> findByPortIdAndActiveTrue(Long portId);
    Page<Berth> findByPortIdAndActiveTrue(Long portId, Pageable pageable);
    List<Berth> findByPortIdAndStatusAndActiveTrue(Long portId, BerthStatus status);
    long countByStatus(BerthStatus status);
    long countByPortIdAndStatus(Long portId, BerthStatus status);
    List<Berth> findByActiveTrueAndStatus(BerthStatus status);

    @Query("SELECT b FROM Berth b WHERE b.active = true AND " +
           "(LOWER(b.berthName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.berthType) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Berth> searchActiveBerths(@Param("search") String search, Pageable pageable);

    Page<Berth> findByActiveTrue(Pageable pageable);
}
