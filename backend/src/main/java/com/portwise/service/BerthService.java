package com.portwise.service;

import com.portwise.dto.request.BerthRequest;
import com.portwise.dto.response.BerthResponse;
import com.portwise.dto.response.PageResponse;
import com.portwise.entity.Berth;
import com.portwise.entity.Port;
import com.portwise.entity.enums.BerthStatus;
import com.portwise.exception.ResourceNotFoundException;
import com.portwise.repository.BerthRepository;
import com.portwise.repository.PortRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BerthService {

    private final BerthRepository berthRepository;
    private final PortRepository portRepository;

    @Transactional
    public BerthResponse create(BerthRequest req) {
        Port port = portRepository.findById(req.getPortId())
            .orElseThrow(() -> new ResourceNotFoundException("Port not found: " + req.getPortId()));
        Berth berth = Berth.builder()
            .port(port)
            .berthName(req.getBerthName())
            .berthType(req.getBerthType())
            .maxDraft(req.getMaxDraft())
            .maxLOA(req.getMaxLOA())
            .cargoType(req.getCargoType())
            .status(req.getStatus() != null ? req.getStatus() : BerthStatus.AVAILABLE)
            .active(true)
            .build();
        return toResponse(berthRepository.save(berth));
    }

    @Transactional(readOnly = true)
    public BerthResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public List<BerthResponse> getByPort(Long portId) {
        return berthRepository.findByPortIdAndActiveTrue(portId)
            .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<BerthResponse> getPaged(String search, Pageable pageable) {
        Page<Berth> page = (search != null && !search.isBlank())
            ? berthRepository.searchActiveBerths(search, pageable)
            : berthRepository.findByActiveTrue(pageable);
        return toPageResponse(page);
    }

    @Transactional
    public BerthResponse update(Long id, BerthRequest req) {
        Berth berth = findById(id);
        Port port = portRepository.findById(req.getPortId())
            .orElseThrow(() -> new ResourceNotFoundException("Port not found: " + req.getPortId()));
        berth.setPort(port);
        berth.setBerthName(req.getBerthName());
        berth.setBerthType(req.getBerthType());
        berth.setMaxDraft(req.getMaxDraft());
        berth.setMaxLOA(req.getMaxLOA());
        berth.setCargoType(req.getCargoType());
        if (req.getStatus() != null) berth.setStatus(req.getStatus());
        return toResponse(berthRepository.save(berth));
    }

    @Transactional
    public BerthResponse updateStatus(Long id, BerthStatus status) {
        Berth berth = findById(id);
        berth.setStatus(status);
        return toResponse(berthRepository.save(berth));
    }

    @Transactional
    public void deactivate(Long id) {
        Berth berth = findById(id);
        berth.setActive(false);
        berthRepository.save(berth);
    }

    private Berth findById(Long id) {
        return berthRepository.findById(id)
            .filter(Berth::isActive)
            .orElseThrow(() -> new ResourceNotFoundException("Berth not found: " + id));
    }

    private PageResponse<BerthResponse> toPageResponse(Page<Berth> page) {
        var content = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    public BerthResponse toResponse(Berth b) {
        return BerthResponse.builder()
            .id(b.getId())
            .portId(b.getPort().getId())
            .portName(b.getPort().getName())
            .berthName(b.getBerthName())
            .berthType(b.getBerthType())
            .maxDraft(b.getMaxDraft())
            .maxLOA(b.getMaxLOA())
            .cargoType(b.getCargoType())
            .status(b.getStatus())
            .active(b.isActive())
            .createdAt(b.getCreatedAt())
            .updatedAt(b.getUpdatedAt())
            .build();
    }
}
