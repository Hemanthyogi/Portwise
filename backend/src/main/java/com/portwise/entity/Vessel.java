package com.portwise.entity;

import com.portwise.entity.enums.VesselStatus;
import com.portwise.entity.enums.VesselType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vessels")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Vessel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String imoNumber;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private VesselType vesselType;

    @Column(length = 50)
    private String flag;

    @Column(precision = 10, scale = 2)
    private BigDecimal deadweightTonnage;

    @Column(precision = 7, scale = 2)
    private BigDecimal lengthOverall;

    @Column(precision = 5, scale = 2)
    private BigDecimal beam;

    @Column(precision = 5, scale = 2)
    private BigDecimal draft;

    @Column(precision = 10, scale = 2)
    private BigDecimal cargoCapacity;

    @Column(length = 200)
    private String currentLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private VesselStatus status = VesselStatus.SCHEDULED;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
