package com.example.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MobileNumberDTO {

    private Long id;

    @Pattern(regexp = "^[0-9+\\-\\s()]{7,20}$", message = "Invalid phone number")
    private String number;
}
