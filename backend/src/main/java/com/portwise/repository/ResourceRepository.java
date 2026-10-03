package com.portwise.repository;

import com.portwise.entity.Resource;
import com.portwise.entity.enums.ResourceStatus;
import com.portwise.entity.enums.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByPortIdAndActiveTrue(Long portId);
    List<Resource> findByPortIdAndActiveTrueAndStatus(Long portId, ResourceStatus status);
    Page<Resource> findByActiveTrue(Pageable pageable);
    long countByStatus(ResourceStatus status);
    Page<Resource> findByActiveTrueAndStatus(ResourceStatus status, Pageable pageable);
    Page<Resource> findByActiveTrueAndResourceType(ResourceType type, Pageable pageable);
}
