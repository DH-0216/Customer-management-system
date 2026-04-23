package com.example.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequestDTO {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
    private String name;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotBlank(message = "NIC number is required")
    @Pattern(regexp = "^[0-9]{9}[vVxX]$|^[0-9]{12}$", message = "Invalid NIC number format")
    private String nicNumber;

    @Valid
    private List<MobileNumberDTO> mobileNumbers = new ArrayList<>();

    @Valid
    private List<AddressDTO> addresses = new ArrayList<>();

    private List<Long> familyMemberIds = new ArrayList<>();
}
