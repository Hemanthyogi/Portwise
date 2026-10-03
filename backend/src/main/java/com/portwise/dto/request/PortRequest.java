package com.portwise.dto.request;

import com.portwise.entity.enums.PortStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PortRequest {
    @NotBlank @Size(min=2, max=100)
    private String name;
    @NotBlank @Size(min=2, max=10)
    private String code;
    private String location;
    private String state;
    private String country;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer numberOfBerths;
    private PortStatus operationalStatus;
}
