package com.portwise;

import com.portwise.entity.Berth;
import com.portwise.entity.Vessel;
import com.portwise.entity.enums.BerthStatus;
import com.portwise.entity.enums.VesselType;
import com.portwise.exception.ConflictException;
import com.portwise.repository.*;
import com.portwise.service.VesselScheduleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BerthConflictTest {

    @Mock
    private VesselScheduleRepository scheduleRepository;
    @Mock
    private VesselRepository vesselRepository;
    @Mock
    private PortRepository portRepository;
    @Mock
    private BerthRepository berthRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VesselScheduleService scheduleService;

    private Berth standardBerth;
    private Vessel smallVessel;
    private Vessel largeVessel;

    @BeforeEach
    void setUp() {
        standardBerth = Berth.builder()
            .id(1L)
            .berthName("Berth-1")
            .maxDraft(new BigDecimal("13.00")) // 13 meters max
            .maxLOA(new BigDecimal("220.00"))   // 220 meters max
            .status(BerthStatus.AVAILABLE)
            .build();

        smallVessel = Vessel.builder()
            .id(1L)
            .name("Small Cargo")
            .vesselType(VesselType.GENERAL_CARGO)
            .draft(new BigDecimal("10.50"))
            .lengthOverall(new BigDecimal("180.00"))
            .build();

        largeVessel = Vessel.builder()
            .id(2L)
            .name("Panamax Giant")
            .vesselType(VesselType.BULK_CARRIER)
            .draft(new BigDecimal("14.50"))    // Exceeds 13.00m
            .lengthOverall(new BigDecimal("250.00")) // Exceeds 220.00m
            .build();
    }

    @Test
    @DisplayName("RULE 2: Vessel draft exceeding berth maxDraft must throw ConflictException")
    void testDraftExceedsBerthMaxDraft() {
        Vessel deepDraftVessel = Vessel.builder()
            .draft(new BigDecimal("15.00"))
            .lengthOverall(new BigDecimal("200.00"))
            .build();

        ConflictException ex = assertThrows(ConflictException.class, () ->
            scheduleService.validateBerthCompatibility(deepDraftVessel, standardBerth));

        assertTrue(ex.getMessage().contains("draft"));
    }

    @Test
    @DisplayName("RULE 3: Vessel LOA exceeding berth maxLOA must throw ConflictException")
    void testLOAExceedsBerthMaxLOA() {
        Vessel longVessel = Vessel.builder()
            .draft(new BigDecimal("11.00"))
            .lengthOverall(new BigDecimal("260.00")) // 260m > 220m
            .build();

        ConflictException ex = assertThrows(ConflictException.class, () ->
            scheduleService.validateBerthCompatibility(longVessel, standardBerth));

        assertTrue(ex.getMessage().contains("LOA"));
    }

    @Test
    @DisplayName("Compatible vessel must pass physical limits check without exception")
    void testCompatibleVesselPasses() {
        assertDoesNotThrow(() ->
            scheduleService.validateBerthCompatibility(smallVessel, standardBerth));
    }

    @Test
    @DisplayName("RULE 1: Overlapping berth schedule window must throw ConflictException")
    void testScheduleBerthConflictDetection() {
        LocalDateTime eta = LocalDateTime.now().plusDays(1);
        LocalDateTime etd = LocalDateTime.now().plusDays(3);

        when(scheduleRepository.existsBerthConflict(1L, eta, etd, -1L)).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () ->
            scheduleService.checkBerthConflict(1L, eta, etd, -1L));

        assertTrue(ex.getMessage().contains("overlapping schedule"));
    }
}
