package com.example.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {

    private Long id;
    private String addressLine1;
    private String addressLine2;
    private Long cityId;
    private String cityName;
    private Long countryId;
    private String countryName;
}
