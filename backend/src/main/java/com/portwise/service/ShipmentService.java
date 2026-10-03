package com.portwise.service;

import com.portwise.dto.request.ShipmentRequest;
import com.portwise.dto.response.PageResponse;
import com.portwise.dto.response.ShipmentResponse;
import com.portwise.entity.Port;
import com.portwise.entity.Shipment;
import com.portwise.entity.Vessel;
import com.portwise.exception.ConflictException;
import com.portwise.exception.ResourceNotFoundException;
import com.portwise.repository.PortRepository;
import com.portwise.repository.ShipmentRepository;
import com.portwise.repository.VesselRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final VesselRepository vesselRepository;
    private final PortRepository portRepository;

    @Transactional
    public ShipmentResponse create(ShipmentRequest req) {
        if (shipmentRepository.existsByShipmentNumber(req.getShipmentNumber())) {
            throw new ConflictException("Shipment number already exists: " + req.getShipmentNumber());
        }

        Vessel vessel = null;
        if (req.getVesselId() != null) {
            vessel = vesselRepository.findById(req.getVesselId())
                .orElseThrow(() -> new ResourceNotFoundException("Vessel not found: " + req.getVesselId()));
        }

        Port originPort = null;
        if (req.getOriginPortId() != null) {
            originPort = portRepository.findById(req.getOriginPortId())
                .orElseThrow(() -> new ResourceNotFoundException("Origin port not found: " + req.getOriginPortId()));
        }

        Port destinationPort = null;
        if (req.getDestinationPortId() != null) {
            destinationPort = portRepository.findById(req.getDestinationPortId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination port not found: " + req.getDestinationPortId()));
        }

        Shipment shipment = Shipment.builder()
            .shipmentNumber(req.getShipmentNumber())
            .vessel(vessel)
            .originPort(originPort)
            .destinationPort(destinationPort)
            .consignee(req.getConsignee())
            .description(req.getDescription())
            .build();
        return toResponse(shipmentRepository.save(shipment));
    }

    @Transactional(readOnly = true)
    public PageResponse<ShipmentResponse> getAll(Pageable pageable) {
        Page<Shipment> page = shipmentRepository.findAll(pageable);
        var content = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Transactional(readOnly = true)
    public ShipmentResponse getById(Long id) {
        Shipment s = shipmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + id));
        return toResponse(s);
    }

    public ShipmentResponse toResponse(Shipment s) {
        return ShipmentResponse.builder()
            .id(s.getId())
            .shipmentNumber(s.getShipmentNumber())
            .vesselId(s.getVessel() != null ? s.getVessel().getId() : null)
            .vesselName(s.getVessel() != null ? s.getVessel().getName() : null)
            .originPortId(s.getOriginPort() != null ? s.getOriginPort().getId() : null)
            .originPortName(s.getOriginPort() != null ? s.getOriginPort().getName() : null)
            .destinationPortId(s.getDestinationPort() != null ? s.getDestinationPort().getId() : null)
            .destinationPortName(s.getDestinationPort() != null ? s.getDestinationPort().getName() : null)
            .consignee(s.getConsignee())
            .description(s.getDescription())
            .createdAt(s.getCreatedAt())
            .updatedAt(s.getUpdatedAt())
            .build();
    }
}
