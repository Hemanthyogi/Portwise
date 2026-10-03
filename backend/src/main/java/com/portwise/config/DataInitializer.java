package com.portwise.config;

import com.portwise.entity.*;
import com.portwise.entity.enums.*;
import com.portwise.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PortRepository portRepository;
    private final BerthRepository berthRepository;
    private final VesselRepository vesselRepository;
    private final ResourceRepository resourceRepository;
    private final ShipmentRepository shipmentRepository;
    private final CargoRepository cargoRepository;
    private final VesselScheduleRepository scheduleRepository;
    private final AlertRepository alertRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking database seed status...");
        if (roleRepository.count() > 0 && userRepository.count() > 0) {
            log.info("Database is already seeded. Skipping DataInitializer.");
            return;
        }

        log.info("Database is uninitialized or running in local in-memory profile. Seeding demo data...");

        // 1. Roles
        Map<RoleName, Role> roles = new EnumMap<>(RoleName.class);
        for (RoleName roleName : RoleName.values()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
            roles.put(roleName, role);
        }

        // 2. Demo Users (Password: Demo@12345)
        String encodedPassword = passwordEncoder.encode("Demo@12345");

        User admin = userRepository.save(User.builder()
                .fullName("Admin User")
                .email("admin@portwise.demo")
                .password(encodedPassword)
                .phone("9000000001")
                .active(true)
                .roles(new HashSet<>(Collections.singletonList(roles.get(RoleName.ADMIN))))
                .build());

        User portAuth = userRepository.save(User.builder()
                .fullName("Port Authority")
                .email("portauthority@portwise.demo")
                .password(encodedPassword)
                .phone("9000000002")
                .active(true)
                .roles(new HashSet<>(Collections.singletonList(roles.get(RoleName.PORT_AUTHORITY))))
                .build());

        User agent = userRepository.save(User.builder()
                .fullName("Shipping Agent")
                .email("agent@portwise.demo")
                .password(encodedPassword)
                .phone("9000000003")
                .active(true)
                .roles(new HashSet<>(Collections.singletonList(roles.get(RoleName.SHIPPING_AGENT))))
                .build());

        User cargoOwner = userRepository.save(User.builder()
                .fullName("Cargo Owner")
                .email("cargo@portwise.demo")
                .password(encodedPassword)
                .phone("9000000004")
                .active(true)
                .roles(new HashSet<>(Collections.singletonList(roles.get(RoleName.CARGO_OWNER))))
                .build());

        userRepository.save(User.builder()
                .fullName("Logistics Operator")
                .email("operator@portwise.demo")
                .password(encodedPassword)
                .phone("9000000005")
                .active(true)
                .roles(new HashSet<>(Collections.singletonList(roles.get(RoleName.LOGISTICS_OPERATOR))))
                .build());

        // 3. Demo Ports
        Port inprd = portRepository.save(Port.builder()
                .name("Paradip Port").code("INPRD").location("Paradip, Odisha").state("Odisha").country("India")
                .latitude(new BigDecimal("20.3170")).longitude(new BigDecimal("86.6074")).numberOfBerths(20)
                .operationalStatus(PortStatus.OPERATIONAL).active(true).build());

        Port invtz = portRepository.save(Port.builder()
                .name("Visakhapatnam Port").code("INVTZ").location("Visakhapatnam, Andhra Pradesh").state("Andhra Pradesh").country("India")
                .latitude(new BigDecimal("17.6868")).longitude(new BigDecimal("83.2185")).numberOfBerths(26)
                .operationalStatus(PortStatus.OPERATIONAL).active(true).build());

        Port inmaa = portRepository.save(Port.builder()
                .name("Chennai Port").code("INMAA").location("Chennai, Tamil Nadu").state("Tamil Nadu").country("India")
                .latitude(new BigDecimal("13.0827")).longitude(new BigDecimal("80.2827")).numberOfBerths(24)
                .operationalStatus(PortStatus.OPERATIONAL).active(true).build());

        Port inenn = portRepository.save(Port.builder()
                .name("Ennore Port").code("INENN").location("Ennore, Tamil Nadu").state("Tamil Nadu").country("India")
                .latitude(new BigDecimal("13.2272")).longitude(new BigDecimal("80.3205")).numberOfBerths(12)
                .operationalStatus(PortStatus.OPERATIONAL).active(true).build());

        Port inkol = portRepository.save(Port.builder()
                .name("Kolkata / Haldia Port").code("INKOL").location("Kolkata/Haldia, West Bengal").state("West Bengal").country("India")
                .latitude(new BigDecimal("22.5726")).longitude(new BigDecimal("88.3639")).numberOfBerths(30)
                .operationalStatus(PortStatus.OPERATIONAL).active(true).build());

        // 4. Demo Berths
        Berth b1 = berthRepository.save(Berth.builder()
                .port(inprd).berthName("INPRD-B1").berthType("Bulk")
                .maxDraft(new BigDecimal("14.50")).maxLOA(new BigDecimal("220.00"))
                .cargoType(CargoType.COAL).status(BerthStatus.AVAILABLE).active(true).build());

        berthRepository.save(Berth.builder()
                .port(inprd).berthName("INPRD-B2").berthType("Bulk")
                .maxDraft(new BigDecimal("13.00")).maxLOA(new BigDecimal("190.00"))
                .cargoType(CargoType.IRON_ORE).status(BerthStatus.AVAILABLE).active(true).build());

        berthRepository.save(Berth.builder()
                .port(inprd).berthName("INPRD-B3").berthType("General")
                .maxDraft(new BigDecimal("10.00")).maxLOA(new BigDecimal("160.00"))
                .cargoType(CargoType.GENERAL_CARGO).status(BerthStatus.AVAILABLE).active(true).build());

        berthRepository.save(Berth.builder()
                .port(invtz).berthName("INVTZ-B1").berthType("Bulk")
                .maxDraft(new BigDecimal("15.00")).maxLOA(new BigDecimal("240.00"))
                .cargoType(CargoType.COAL).status(BerthStatus.AVAILABLE).active(true).build());

        berthRepository.save(Berth.builder()
                .port(inmaa).berthName("INMAA-B1").berthType("Container")
                .maxDraft(new BigDecimal("13.00")).maxLOA(new BigDecimal("300.00"))
                .cargoType(CargoType.CONTAINERIZED).status(BerthStatus.AVAILABLE).active(true).build());

        // 5. Demo Vessels
        Vessel v1 = vesselRepository.save(Vessel.builder()
                .imoNumber("IMO9876543").name("MV Eastern Glory").vesselType(VesselType.BULK_CARRIER).flag("India")
                .deadweightTonnage(new BigDecimal("75000.00")).lengthOverall(new BigDecimal("225.00"))
                .beam(new BigDecimal("32.00")).draft(new BigDecimal("13.50"))
                .cargoCapacity(new BigDecimal("70000.00")).currentLocation("At Sea - Bay of Bengal")
                .status(VesselStatus.ARRIVING).active(true).build());

        Vessel v2 = vesselRepository.save(Vessel.builder()
                .imoNumber("IMO9876544").name("MV Ocean Star").vesselType(VesselType.CONTAINER).flag("Panama")
                .deadweightTonnage(new BigDecimal("45000.00")).lengthOverall(new BigDecimal("295.00"))
                .beam(new BigDecimal("32.20")).draft(new BigDecimal("11.00"))
                .cargoCapacity(new BigDecimal("40000.00")).currentLocation("Paradip Port")
                .status(VesselStatus.AT_BERTH).active(true).build());

        vesselRepository.save(Vessel.builder()
                .imoNumber("IMO9876545").name("MV Blue Horizon").vesselType(VesselType.TANKER).flag("Liberia")
                .deadweightTonnage(new BigDecimal("60000.00")).lengthOverall(new BigDecimal("198.00"))
                .beam(new BigDecimal("28.00")).draft(new BigDecimal("13.80"))
                .cargoCapacity(new BigDecimal("55000.00")).currentLocation("At Sea - Indian Ocean")
                .status(VesselStatus.SCHEDULED).active(true).build());

        // 6. Demo Resources
        resourceRepository.save(Resource.builder()
                .name("Crane-1").resourceType(ResourceType.CRANE).port(inprd)
                .description("Bulk cargo crane capacity 40T").status(ResourceStatus.AVAILABLE).active(true).build());

        resourceRepository.save(Resource.builder()
                .name("Crane-2").resourceType(ResourceType.CRANE).port(inprd)
                .description("Bulk cargo crane capacity 40T").status(ResourceStatus.ALLOCATED).active(true).build());

        resourceRepository.save(Resource.builder()
                .name("Forklift-1").resourceType(ResourceType.FORKLIFT).port(inprd)
                .description("Heavy forklift 10T capacity").status(ResourceStatus.AVAILABLE).active(true).build());

        // 7. Demo Shipments
        Shipment s1 = shipmentRepository.save(Shipment.builder()
                .shipmentNumber("SHP-2024-001").vessel(v1).originPort(inkol).destinationPort(inprd)
                .consignee("Eastern Steel Pvt Ltd").description("Coal shipment").build());

        // 8. Demo Cargo
        cargoRepository.save(Cargo.builder()
                .cargoType(CargoType.COAL).description("[DEMO] Thermal Coal from Odisha")
                .quantity(new BigDecimal("65000.00")).unit("MT").origin("Kolkata").destination("Paradip")
                .consignee("Eastern Steel Pvt Ltd").shipment(s1).owner(cargoOwner)
                .status(CargoStatus.IN_TRANSIT).build());

        cargoRepository.save(Cargo.builder()
                .cargoType(CargoType.FERTILIZER).description("[DEMO] Urea Fertilizer")
                .quantity(new BigDecimal("12000.00")).unit("MT").origin("Vizag").destination("Paradip")
                .consignee("Agro Fertilizers Ltd").owner(cargoOwner)
                .status(CargoStatus.REGISTERED).build());

        // 9. Demo Vessel Schedule
        scheduleRepository.save(VesselSchedule.builder()
                .vessel(v1).port(inprd).berth(b1)
                .eta(LocalDateTime.now().plusHours(6)).etd(LocalDateTime.now().plusDays(2))
                .status(ScheduleStatus.APPROVED).remarks("[DEMO] Coal unloading operation")
                .submittedBy(agent).approvedBy(portAuth).approvedAt(LocalDateTime.now().minusDays(1))
                .build());

        // 10. Demo Alerts
        alertRepository.save(Alert.builder()
                .port(inprd).severity(AlertSeverity.WARNING).status(AlertStatus.ACTIVE)
                .title("Weather Alert: Rough Seas").description("Moderate swell expected near Paradip approach")
                .relatedEntityType("VESSEL").relatedEntityId(v1.getId())
                .build());

        log.info("PORTWISE Demo data successfully initialized for local profile!");
    }
}
