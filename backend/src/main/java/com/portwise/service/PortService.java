package com.portwise.service;

import com.portwise.dto.request.PortRequest;
import com.portwise.dto.response.PageResponse;
import com.portwise.dto.response.PortResponse;
import com.portwise.entity.Port;
import com.portwise.entity.enums.PortStatus;
import com.portwise.exception.ConflictException;
import com.portwise.exception.ResourceNotFoundException;
import com.portwise.repository.PortRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PortService {

    private final PortRepository portRepository;

    @Transactional
    public PortResponse create(PortRequest req) {
        if (portRepository.existsByCode(req.getCode().toUpperCase())) {
            throw new ConflictException("Port code already exists: " + req.getCode());
        }
        Port port = Port.builder()
            .name(req.getName())
            .code(req.getCode().toUpperCase())
            .location(req.getLocation())
            .state(req.getState())
            .country(req.getCountry())
            .latitude(req.getLatitude())
            .longitude(req.getLongitude())
            .numberOfBerths(req.getNumberOfBerths())
            .operationalStatus(req.getOperationalStatus() != null ? req.getOperationalStatus() : PortStatus.OPERATIONAL)
            .active(true)
            .build();
        return toResponse(portRepository.save(port));
    }

    @Transactional(readOnly = true)
    public PortResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public List<PortResponse> getAll() {
        return portRepository.findByActiveTrue().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<PortResponse> getPaged(String search, Pageable pageable) {
        Page<Port> page = (search != null && !search.isBlank())
            ? portRepository.searchActivePorts(search, pageable)
            : portRepository.findByActiveTrue(pageable);
        return toPageResponse(page);
    }

    @Transactional
    public PortResponse update(Long id, PortRequest req) {
        Port port = findById(id);
        if (!port.getCode().equalsIgnoreCase(req.getCode()) &&
                portRepository.existsByCode(req.getCode().toUpperCase())) {
            throw new ConflictException("Port code already exists: " + req.getCode());
        }
        port.setName(req.getName());
        port.setCode(req.getCode().toUpperCase());
        port.setLocation(req.getLocation());
        port.setState(req.getState());
        port.setCountry(req.getCountry());
        port.setLatitude(req.getLatitude());
        port.setLongitude(req.getLongitude());
        port.setNumberOfBerths(req.getNumberOfBerths());
        if (req.getOperationalStatus() != null) port.setOperationalStatus(req.getOperationalStatus());
        return toResponse(portRepository.save(port));
    }

    @Transactional
    public void deactivate(Long id) {
        Port port = findById(id);
        port.setActive(false);
        portRepository.save(port);
    }

    private Port findById(Long id) {
        return portRepository.findById(id)
            .filter(Port::isActive)
            .orElseThrow(() -> new ResourceNotFoundException("Port not found: " + id));
    }

    private PageResponse<PortResponse> toPageResponse(Page<Port> page) {
        var content = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    public PortResponse toResponse(Port p) {
        return PortResponse.builder()
            .id(p.getId()).name(p.getName()).code(p.getCode())
            .location(p.getLocation()).state(p.getState()).country(p.getCountry())
            .latitude(p.getLatitude()).longitude(p.getLongitude())
            .numberOfBerths(p.getNumberOfBerths())
            .operationalStatus(p.getOperationalStatus())
            .active(p.isActive()).createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt())
            .build();
    }
}
