package com.portwise.entity;

import com.portwise.entity.enums.BerthStatus;
import com.portwise.entity.enums.CargoType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "berths")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Berth {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "port_id", nullable = false)
    private Port port;

    @Column(nullable = false, length = 50)
    private String berthName;

    @Column(length = 50)
    private String berthType;

    @Column(precision = 5, scale = 2)
    private BigDecimal maxDraft;

    @Column(precision = 7, scale = 2)
    private BigDecimal maxLOA;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private CargoType cargoType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BerthStatus status = BerthStatus.AVAILABLE;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
