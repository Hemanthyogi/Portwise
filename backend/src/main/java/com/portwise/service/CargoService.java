package com.portwise.service;

import com.portwise.dto.request.CargoMovementRequest;
import com.portwise.dto.request.CargoRequest;
import com.portwise.dto.response.CargoMovementResponse;
import com.portwise.dto.response.CargoResponse;
import com.portwise.dto.response.PageResponse;
import com.portwise.entity.Cargo;
import com.portwise.entity.CargoMovement;
import com.portwise.entity.Shipment;
import com.portwise.entity.User;
import com.portwise.entity.enums.CargoStatus;
import com.portwise.exception.BadRequestException;
import com.portwise.exception.ResourceNotFoundException;
import com.portwise.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CargoService {

    private final CargoRepository cargoRepository;
    private final CargoMovementRepository movementRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public CargoResponse create(CargoRequest req) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        User owner = email != null ? userRepository.findByEmail(email).orElse(null) : null;

        Shipment shipment = null;
        if (req.getShipmentId() != null) {
            shipment = shipmentRepository.findById(req.getShipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + req.getShipmentId()));
        }

        Cargo cargo = Cargo.builder()
            .cargoType(req.getCargoType())
            .description(req.getDescription())
            .quantity(req.getQuantity())
            .unit(req.getUnit())
            .origin(req.getOrigin())
            .destination(req.getDestination())
            .consignee(req.getConsignee())
            .shipment(shipment)
            .owner(owner)
            .status(CargoStatus.REGISTERED)
            .build();
        Cargo saved = cargoRepository.save(cargo);

        // Create initial movement record
        CargoMovement movement = CargoMovement.builder()
            .cargo(saved)
            .status("REGISTERED")
            .location(req.getOrigin() != null ? req.getOrigin() : "Origin Port")
            .operator(owner)
            .remarks("Cargo registered in system")
            .timestamp(LocalDateTime.now())
            .build();
        movementRepository.save(movement);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public CargoResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<CargoResponse> getPaged(String search, CargoStatus status, Pageable pageable) {
        Page<Cargo> page;
        if (search != null && !search.isBlank()) {
            page = cargoRepository.searchCargo(search, pageable);
        } else if (status != null) {
            page = cargoRepository.findByStatus(status, pageable);
        } else {
            page = cargoRepository.findAll(pageable);
        }
        return toPageResponse(page);
    }

    @Transactional
    public CargoResponse updateStatus(Long id, CargoStatus newStatus) {
        Cargo cargo = findById(id);
        // Business rule 7: Completed cargo cannot return to REGISTERED without an explicit administrative correction
        if (cargo.getStatus() == CargoStatus.COMPLETED && newStatus == CargoStatus.REGISTERED) {
            throw new BadRequestException("Completed cargo cannot return to REGISTERED status");
        }
        cargo.setStatus(newStatus);
        Cargo saved = cargoRepository.save(cargo);

        var auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        User operator = email != null ? userRepository.findByEmail(email).orElse(null) : null;
        CargoMovement movement = CargoMovement.builder()
            .cargo(saved)
            .status(newStatus.name())
            .location(cargo.getDestination() != null ? cargo.getDestination() : "In Transit / Port")
            .operator(operator)
            .remarks("Status updated to " + newStatus)
            .timestamp(LocalDateTime.now())
            .build();
        movementRepository.save(movement);

        return toResponse(saved);
    }

    @Transactional
    public CargoMovementResponse addMovement(CargoMovementRequest req) {
        Cargo cargo = findById(req.getCargoId());
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        User operator = email != null ? userRepository.findByEmail(email).orElse(null) : null;

        CargoMovement movement = CargoMovement.builder()
            .cargo(cargo)
            .status(req.getStatus())
            .location(req.getLocation())
            .operator(operator)
            .remarks(req.getRemarks())
            .timestamp(req.getTimestamp() != null ? req.getTimestamp() : LocalDateTime.now())
            .build();
        return toMovementResponse(movementRepository.save(movement));
    }

    @Transactional(readOnly = true)
    public List<CargoMovementResponse> getMovements(Long cargoId) {
        return movementRepository.findByCargoIdOrderByTimestampAsc(cargoId)
            .stream().map(this::toMovementResponse).toList();
    }

    private Cargo findById(Long id) {
        return cargoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cargo not found: " + id));
    }

    private PageResponse<CargoResponse> toPageResponse(Page<Cargo> page) {
        var content = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    public CargoResponse toResponse(Cargo c) {
        return CargoResponse.builder()
            .id(c.getId()).cargoType(c.getCargoType()).description(c.getDescription())
            .quantity(c.getQuantity()).unit(c.getUnit())
            .origin(c.getOrigin()).destination(c.getDestination()).consignee(c.getConsignee())
            .shipmentId(c.getShipment() != null ? c.getShipment().getId() : null)
            .shipmentNumber(c.getShipment() != null ? c.getShipment().getShipmentNumber() : null)
            .ownerId(c.getOwner() != null ? c.getOwner().getId() : null)
            .ownerName(c.getOwner() != null ? c.getOwner().getFullName() : null)
            .status(c.getStatus()).createdAt(c.getCreatedAt()).updatedAt(c.getUpdatedAt())
            .build();
    }

    public CargoMovementResponse toMovementResponse(CargoMovement m) {
        return CargoMovementResponse.builder()
            .id(m.getId()).cargoId(m.getCargo().getId())
            .status(m.getStatus()).location(m.getLocation())
            .operatorId(m.getOperator() != null ? m.getOperator().getId() : null)
            .operatorName(m.getOperator() != null ? m.getOperator().getFullName() : null)
            .remarks(m.getRemarks()).timestamp(m.getTimestamp()).createdAt(m.getCreatedAt())
            .build();
    }
}
