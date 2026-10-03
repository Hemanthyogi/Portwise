package com.portwise.dto.request;

import com.portwise.entity.enums.BerthStatus;
import com.portwise.entity.enums.CargoType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BerthRequest {
    @NotNull
    private Long portId;
    @NotBlank
    private String berthName;
    private String berthType;
    @Positive
    private BigDecimal maxDraft;
    @Positive
    private BigDecimal maxLOA;
    private CargoType cargoType;
    private BerthStatus status;
}
