package com.example.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponseDTO {

    private Long id;
    private String name;
    private LocalDate dateOfBirth;
    private String nicNumber;

    private List<MobileNumberDTO> mobileNumbers;
    private List<AddressDTO> addresses;
    private List<FamilyMemberDTO> familyMembers;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FamilyMemberDTO {
        private Long id;
        private String name;
        private String nicNumber;
    }
}
