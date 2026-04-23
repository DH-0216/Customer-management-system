package com.example.backend.service;

import com.example.backend.dto.MasterDataDTO;
import com.example.backend.repository.CityRepository;
import com.example.backend.repository.CountryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MasterDataService {

    private final CountryRepository countryRepository;
    private final CityRepository    cityRepository;

    @Transactional(readOnly = true)
    public List<MasterDataDTO> getAllCountries() {
        return countryRepository.findAll().stream()
                .map(c -> new MasterDataDTO(c.getId(), c.getName()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MasterDataDTO> getCitiesByCountry(Long countryId) {
        return cityRepository.findByCountryId(countryId).stream()
                .map(c -> new MasterDataDTO(c.getId(), c.getName()))
                .collect(Collectors.toList());
    }
}
