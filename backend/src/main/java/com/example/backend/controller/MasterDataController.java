package com.example.backend.controller;

import com.example.backend.dto.MasterDataDTO;
import com.example.backend.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master")
@RequiredArgsConstructor
public class MasterDataController {

    private final MasterDataService masterDataService;

    /** GET /api/master/countries */
    @GetMapping("/countries")
    public ResponseEntity<List<MasterDataDTO>> getCountries() {
        return ResponseEntity.ok(masterDataService.getAllCountries());
    }

    /** GET /api/master/cities?countryId=1 */
    @GetMapping("/cities")
    public ResponseEntity<List<MasterDataDTO>> getCities(
            @RequestParam Long countryId) {
        return ResponseEntity.ok(masterDataService.getCitiesByCountry(countryId));
    }
}
