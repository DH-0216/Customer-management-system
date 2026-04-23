package com.example.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

/**
 * Lightweight DTO for table/list views — avoids loading collections eagerly.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSummaryDTO {

    private Long id;
    private String name;
    private LocalDate dateOfBirth;
    private String nicNumber;
    private int mobileCount;
    private int addressCount;
    private int familyCount;
}
