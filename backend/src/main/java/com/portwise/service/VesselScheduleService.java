package com.portwise.service;

import com.portwise.dto.request.ScheduleStatusRequest;
import com.portwise.dto.request.VesselScheduleRequest;
import com.portwise.dto.response.PageResponse;
import com.portwise.dto.response.VesselScheduleResponse;
import com.portwise.entity.*;
import com.portwise.entity.enums.BerthStatus;
import com.portwise.entity.enums.ScheduleStatus;
import com.portwise.exception.BadRequestException;
import com.portwise.exception.ConflictException;
import com.portwise.exception.ResourceNotFoundException;
import com.portwise.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VesselScheduleService {

    private final VesselScheduleRepository scheduleRepository;
    private final VesselRepository vesselRepository;
    private final PortRepository portRepository;
    private final BerthRepository berthRepository;
    private final UserRepository userRepository;

    @Transactional
    public VesselScheduleResponse create(VesselScheduleRequest req) {
        if (!req.getEta().isBefore(req.getEtd())) {
            throw new BadRequestException("ETA must be before ETD");
        }

        Vessel vessel = vesselRepository.findById(req.getVesselId())
            .orElseThrow(() -> new ResourceNotFoundException("Vessel not found: " + req.getVesselId()));
        Port port = portRepository.findById(req.getPortId())
            .orElseThrow(() -> new ResourceNotFoundException("Port not found: " + req.getPortId()));

        Berth berth = null;
        if (req.getBerthId() != null) {
            berth = berthRepository.findById(req.getBerthId())
                .orElseThrow(() -> new ResourceNotFoundException("Berth not found: " + req.getBerthId()));
            validateBerthCompatibility(vessel, berth);
            checkBerthConflict(req.getBerthId(), req.getEta(), req.getEtd(), -1L);
        }

        var auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        User submittedBy = email != null ? userRepository.findByEmail(email).orElse(null) : null;

        VesselSchedule schedule = VesselSchedule.builder()
            .vessel(vessel).port(port).berth(berth)
            .eta(req.getEta()).etd(req.getEtd())
            .status(ScheduleStatus.PENDING)
            .remarks(req.getRemarks())
            .submittedBy(submittedBy)
            .build();
        return toResponse(scheduleRepository.save(schedule));
    }

    @Transactional(readOnly = true)
    public VesselScheduleResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<VesselScheduleResponse> getAll(Pageable pageable) {
        Page<VesselSchedule> page = scheduleRepository.findAll(pageable);
        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<VesselScheduleResponse> getByStatus(ScheduleStatus status, Pageable pageable) {
        Page<VesselSchedule> page = scheduleRepository.findByStatus(status, pageable);
        return toPageResponse(page);
    }

    @Transactional
    public VesselScheduleResponse updateStatus(Long id, ScheduleStatusRequest req) {
        VesselSchedule schedule = findById(id);
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        User approver = email != null ? userRepository.findByEmail(email).orElse(null) : null;

        if (req.getBerthId() != null) {
            Berth berth = berthRepository.findById(req.getBerthId())
                .orElseThrow(() -> new ResourceNotFoundException("Berth not found"));
            validateBerthCompatibility(schedule.getVessel(), berth);
            checkBerthConflict(req.getBerthId(), schedule.getEta(), schedule.getEtd(), id);
            schedule.setBerth(berth);
            if (req.getStatus() == ScheduleStatus.APPROVED) {
                berth.setStatus(BerthStatus.RESERVED);
                berthRepository.save(berth);
            }
        }

        schedule.setStatus(req.getStatus());
        if (req.getRemarks() != null) schedule.setRemarks(req.getRemarks());
        if (req.getStatus() == ScheduleStatus.APPROVED) {
            schedule.setApprovedBy(approver);
            schedule.setApprovedAt(LocalDateTime.now());
        }
        return toResponse(scheduleRepository.save(schedule));
    }

    public void validateBerthCompatibility(Vessel vessel, Berth berth) {
        if (vessel.getDraft() != null && berth.getMaxDraft() != null &&
                vessel.getDraft().compareTo(berth.getMaxDraft()) > 0) {
            throw new ConflictException(String.format(
                "Vessel draft (%.2fm) exceeds berth max draft (%.2fm)",
                vessel.getDraft(), berth.getMaxDraft()));
        }
        if (vessel.getLengthOverall() != null && berth.getMaxLOA() != null &&
                vessel.getLengthOverall().compareTo(berth.getMaxLOA()) > 0) {
            throw new ConflictException(String.format(
                "Vessel LOA (%.2fm) exceeds berth max LOA (%.2fm)",
                vessel.getLengthOverall(), berth.getMaxLOA()));
        }
    }

    public void checkBerthConflict(Long berthId, LocalDateTime eta, LocalDateTime etd, Long excludeId) {
        if (scheduleRepository.existsBerthConflict(berthId, eta, etd, excludeId)) {
            throw new ConflictException("Berth has an overlapping schedule for the requested time window");
        }
    }

    private VesselSchedule findById(Long id) {
        return scheduleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Schedule not found: " + id));
    }

    private PageResponse<VesselScheduleResponse> toPageResponse(Page<VesselSchedule> page) {
        var content = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    public VesselScheduleResponse toResponse(VesselSchedule s) {
        return VesselScheduleResponse.builder()
            .id(s.getId())
            .vesselId(s.getVessel().getId())
            .vesselName(s.getVessel().getName())
            .vesselImo(s.getVessel().getImoNumber())
            .portId(s.getPort().getId())
            .portName(s.getPort().getName())
            .berthId(s.getBerth() != null ? s.getBerth().getId() : null)
            .berthName(s.getBerth() != null ? s.getBerth().getBerthName() : null)
            .eta(s.getEta()).etd(s.getEtd())
            .status(s.getStatus())
            .remarks(s.getRemarks())
            .submittedById(s.getSubmittedBy() != null ? s.getSubmittedBy().getId() : null)
            .submittedByName(s.getSubmittedBy() != null ? s.getSubmittedBy().getFullName() : null)
            .approvedById(s.getApprovedBy() != null ? s.getApprovedBy().getId() : null)
            .approvedByName(s.getApprovedBy() != null ? s.getApprovedBy().getFullName() : null)
            .approvedAt(s.getApprovedAt())
            .createdAt(s.getCreatedAt())
            .updatedAt(s.getUpdatedAt())
            .build();
    }
}
