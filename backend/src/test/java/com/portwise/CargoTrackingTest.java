package com.portwise;

import com.portwise.dto.response.CargoResponse;
import com.portwise.entity.Cargo;
import com.portwise.entity.enums.CargoStatus;
import com.portwise.entity.enums.CargoType;
import com.portwise.exception.BadRequestException;
import com.portwise.repository.CargoMovementRepository;
import com.portwise.repository.CargoRepository;
import com.portwise.repository.ShipmentRepository;
import com.portwise.repository.UserRepository;
import com.portwise.service.CargoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CargoTrackingTest {

    @Mock
    private CargoRepository cargoRepository;
    @Mock
    private CargoMovementRepository movementRepository;
    @Mock
    private ShipmentRepository shipmentRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CargoService cargoService;

    @Test
    @DisplayName("RULE 7: Completed cargo cannot return to REGISTERED status")
    void testCompletedCargoCannotRevertToRegistered() {
        Cargo completedCargo = Cargo.builder()
            .id(10L)
            .cargoType(CargoType.COAL)
            .quantity(new BigDecimal("50000"))
            .unit("MT")
            .status(CargoStatus.COMPLETED)
            .build();

        when(cargoRepository.findById(10L)).thenReturn(Optional.of(completedCargo));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
            cargoService.updateStatus(10L, CargoStatus.REGISTERED));

        assertTrue(ex.getMessage().contains("Completed cargo cannot return to REGISTERED"));
        verify(cargoRepository, never()).save(any(Cargo.class));
    }

    @Test
    @DisplayName("Valid status transition creates timeline movement event")
    void testValidStatusTransition() {
        Cargo transitCargo = Cargo.builder()
            .id(11L)
            .cargoType(CargoType.GRAIN)
            .quantity(new BigDecimal("20000"))
            .unit("MT")
            .status(CargoStatus.IN_TRANSIT)
            .build();

        when(cargoRepository.findById(11L)).thenReturn(Optional.of(transitCargo));
        when(cargoRepository.save(any(Cargo.class))).thenAnswer(i -> i.getArgument(0));

        CargoResponse resp = cargoService.updateStatus(11L, CargoStatus.AT_PORT);

        assertNotNull(resp);
        assertEquals(CargoStatus.AT_PORT, resp.getStatus());
        verify(movementRepository, times(1)).save(any());
    }
}
