package com.portwise.dto.request;

import com.portwise.entity.enums.VesselType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class VesselRequest {
    @NotBlank
    @Pattern(regexp = "IMO\\d{7}", message = "IMO number must be in format IMO followed by 7 digits")
    private String imoNumber;
    @NotBlank
    private String name;
    @NotNull
    private VesselType vesselType;
    private String flag;
    @Positive
    private BigDecimal deadweightTonnage;
    @Positive
    private BigDecimal lengthOverall;
    @Positive
    private BigDecimal beam;
    @Positive
    private BigDecimal draft;
    @Positive
    private BigDecimal cargoCapacity;
    private String currentLocation;
}
