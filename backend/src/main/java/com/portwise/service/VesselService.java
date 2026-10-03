package com.portwise.service;

import com.portwise.dto.request.VesselRequest;
import com.portwise.dto.response.PageResponse;
import com.portwise.dto.response.VesselResponse;
import com.portwise.entity.Vessel;
import com.portwise.entity.enums.VesselStatus;
import com.portwise.exception.ConflictException;
import com.portwise.exception.ResourceNotFoundException;
import com.portwise.repository.VesselRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VesselService {

    private final VesselRepository vesselRepository;

    @Transactional
    public VesselResponse create(VesselRequest req) {
        if (vesselRepository.existsByImoNumber(req.getImoNumber())) {
            throw new ConflictException("Vessel with IMO " + req.getImoNumber() + " already exists");
        }
        Vessel vessel = Vessel.builder()
            .imoNumber(req.getImoNumber())
            .name(req.getName())
            .vesselType(req.getVesselType())
            .flag(req.getFlag())
            .deadweightTonnage(req.getDeadweightTonnage())
            .lengthOverall(req.getLengthOverall())
            .beam(req.getBeam())
            .draft(req.getDraft())
            .cargoCapacity(req.getCargoCapacity())
            .currentLocation(req.getCurrentLocation())
            .status(VesselStatus.SCHEDULED)
            .active(true)
            .build();
        return toResponse(vesselRepository.save(vessel));
    }

    @Transactional(readOnly = true)
    public VesselResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public List<VesselResponse> getAll() {
        return vesselRepository.findByActiveTrue().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<VesselResponse> getPaged(String search, VesselStatus status, Pageable pageable) {
        Page<Vessel> page;
        if (search != null && !search.isBlank()) {
            page = vesselRepository.searchActiveVessels(search, pageable);
        } else if (status != null) {
            page = vesselRepository.findByActiveTrueAndStatus(status, pageable);
        } else {
            page = vesselRepository.findByActiveTrue(pageable);
        }
        return toPageResponse(page);
    }

    @Transactional
    public VesselResponse update(Long id, VesselRequest req) {
        Vessel vessel = findById(id);
        if (!vessel.getImoNumber().equalsIgnoreCase(req.getImoNumber()) &&
                vesselRepository.existsByImoNumber(req.getImoNumber())) {
            throw new ConflictException("IMO number already exists: " + req.getImoNumber());
        }
        vessel.setImoNumber(req.getImoNumber());
        vessel.setName(req.getName());
        vessel.setVesselType(req.getVesselType());
        vessel.setFlag(req.getFlag());
        vessel.setDeadweightTonnage(req.getDeadweightTonnage());
        vessel.setLengthOverall(req.getLengthOverall());
        vessel.setBeam(req.getBeam());
        vessel.setDraft(req.getDraft());
        vessel.setCargoCapacity(req.getCargoCapacity());
        vessel.setCurrentLocation(req.getCurrentLocation());
        return toResponse(vesselRepository.save(vessel));
    }

    @Transactional
    public VesselResponse updateStatus(Long id, VesselStatus status) {
        Vessel vessel = findById(id);
        vessel.setStatus(status);
        return toResponse(vesselRepository.save(vessel));
    }

    @Transactional
    public void deactivate(Long id) {
        Vessel vessel = findById(id);
        vessel.setActive(false);
        vesselRepository.save(vessel);
    }

    private Vessel findById(Long id) {
        return vesselRepository.findById(id)
            .filter(Vessel::isActive)
            .orElseThrow(() -> new ResourceNotFoundException("Vessel not found: " + id));
    }

    private PageResponse<VesselResponse> toPageResponse(Page<Vessel> page) {
        var content = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    public VesselResponse toResponse(Vessel v) {
        return VesselResponse.builder()
            .id(v.getId()).imoNumber(v.getImoNumber()).name(v.getName())
            .vesselType(v.getVesselType()).flag(v.getFlag())
            .deadweightTonnage(v.getDeadweightTonnage()).lengthOverall(v.getLengthOverall())
            .beam(v.getBeam()).draft(v.getDraft()).cargoCapacity(v.getCargoCapacity())
            .currentLocation(v.getCurrentLocation()).status(v.getStatus())
            .active(v.isActive()).createdAt(v.getCreatedAt()).updatedAt(v.getUpdatedAt())
            .build();
    }
}
