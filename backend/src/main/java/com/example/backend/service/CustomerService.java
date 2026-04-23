package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.entity.*;
import com.example.backend.exception.DuplicateNicException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CountryRepository  countryRepository;
    private final CityRepository     cityRepository;

    // ── Create ─────────────────────────────────────────────────────────────────

    @Transactional
    public CustomerResponseDTO createCustomer(CustomerRequestDTO dto) {
        if (customerRepository.existsByNicNumber(dto.getNicNumber())) {
            throw new DuplicateNicException(dto.getNicNumber());
        }
        Customer customer = buildCustomer(new Customer(), dto);
        customer = customerRepository.save(customer);
        linkFamilyMembers(customer, dto.getFamilyMemberIds());
        return toResponseDTO(customer);
    }

    // ── Update ─────────────────────────────────────────────────────────────────

    @Transactional
    public CustomerResponseDTO updateCustomer(Long id, CustomerRequestDTO dto) {
        Customer customer = findById(id);
        if (customerRepository.existsByNicNumberAndIdNot(dto.getNicNumber(), id)) {
            throw new DuplicateNicException(dto.getNicNumber());
        }
        customer.clearMobileNumbers();
        customer.clearAddresses();
        customer.getFamilyMembers().clear();

        buildCustomer(customer, dto);
        customer = customerRepository.save(customer);
        linkFamilyMembers(customer, dto.getFamilyMemberIds());
        return toResponseDTO(customer);
    }

    // ── Read single ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CustomerResponseDTO getCustomer(Long id) {
        return toResponseDTO(findById(id));
    }

    // ── Read paginated list ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<CustomerSummaryDTO> getCustomers(String search, Pageable pageable) {
        Page<Customer> page;
        if (search != null && !search.trim().isEmpty()) {
            page = customerRepository.findByNameOrNicContaining(search.trim(), pageable);
        } else {
            page = customerRepository.findAll(pageable);
        }
        return page.map(this::toSummaryDTO);
    }

    // ── Search (typeahead) ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CustomerSummaryDTO> search(String query) {
        Pageable limit = PageRequest.of(0, 20);
        return customerRepository.searchByNameOrNic(query, limit)
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private Customer buildCustomer(Customer customer, CustomerRequestDTO dto) {
        customer.setName(dto.getName());
        customer.setDateOfBirth(dto.getDateOfBirth());
        customer.setNicNumber(dto.getNicNumber());

        // Mobile numbers
        if (dto.getMobileNumbers() != null) {
            dto.getMobileNumbers().forEach(mDto -> {
                if (mDto.getNumber() != null && !mDto.getNumber().isBlank()) {
                    MobileNumber m = new MobileNumber();
                    m.setNumber(mDto.getNumber().trim());
                    customer.addMobileNumber(m);
                }
            });
        }

        // Addresses
        if (dto.getAddresses() != null) {
            dto.getAddresses().forEach(aDto -> {
                Address a = new Address();
                a.setAddressLine1(aDto.getAddressLine1());
                a.setAddressLine2(aDto.getAddressLine2());
                if (aDto.getCountryId() != null) {
                    a.setCountry(countryRepository.findById(aDto.getCountryId()).orElse(null));
                }
                if (aDto.getCityId() != null) {
                    a.setCity(cityRepository.findById(aDto.getCityId()).orElse(null));
                }
                customer.addAddress(a);
            });
        }

        return customer;
    }

    private void linkFamilyMembers(Customer customer, List<Long> familyMemberIds) {
        if (familyMemberIds == null || familyMemberIds.isEmpty()) return;
        Set<Customer> members = new HashSet<>();
        for (Long memberId : familyMemberIds) {
            if (!memberId.equals(customer.getId())) {
                Customer member = customerRepository.findById(memberId).orElse(null);
                if (member != null) members.add(member);
            }
        }
        customer.setFamilyMembers(members);
        customerRepository.save(customer);
    }

    private Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
    }

    // ── DTO mappers ────────────────────────────────────────────────────────────

    private CustomerResponseDTO toResponseDTO(Customer c) {
        CustomerResponseDTO dto = new CustomerResponseDTO();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setDateOfBirth(c.getDateOfBirth());
        dto.setNicNumber(c.getNicNumber());

        dto.setMobileNumbers(
            c.getMobileNumbers().stream()
                .map(m -> new MobileNumberDTO(m.getId(), m.getNumber()))
                .collect(Collectors.toList())
        );

        dto.setAddresses(
            c.getAddresses().stream()
                .map(a -> {
                    AddressDTO ad = new AddressDTO();
                    ad.setId(a.getId());
                    ad.setAddressLine1(a.getAddressLine1());
                    ad.setAddressLine2(a.getAddressLine2());
                    if (a.getCity() != null) {
                        ad.setCityId(a.getCity().getId());
                        ad.setCityName(a.getCity().getName());
                    }
                    if (a.getCountry() != null) {
                        ad.setCountryId(a.getCountry().getId());
                        ad.setCountryName(a.getCountry().getName());
                    }
                    return ad;
                })
                .collect(Collectors.toList())
        );

        dto.setFamilyMembers(
            c.getFamilyMembers().stream()
                .map(f -> new CustomerResponseDTO.FamilyMemberDTO(f.getId(), f.getName(), f.getNicNumber()))
                .collect(Collectors.toList())
        );

        return dto;
    }

    private CustomerSummaryDTO toSummaryDTO(Customer c) {
        return new CustomerSummaryDTO(
            c.getId(),
            c.getName(),
            c.getDateOfBirth(),
            c.getNicNumber(),
            c.getMobileNumbers().size(),
            c.getAddresses().size(),
            c.getFamilyMembers().size()
        );
    }
}
