package com.example.backend.service;

import com.example.backend.dto.CustomerRequestDTO;
import com.example.backend.dto.CustomerResponseDTO;
import com.example.backend.entity.Customer;
import com.example.backend.exception.DuplicateNicException;
import com.example.backend.repository.CityRepository;
import com.example.backend.repository.CountryRepository;
import com.example.backend.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CountryRepository countryRepository;

    @Mock
    private CityRepository cityRepository;

    @InjectMocks
    private CustomerService customerService;

    private CustomerRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        requestDTO = new CustomerRequestDTO();
        requestDTO.setName("John Doe");
        requestDTO.setNicNumber("199012345678");
        requestDTO.setDateOfBirth(LocalDate.of(1990, 1, 1));
    }

    @Test
    void testCreateCustomer_Success() {
        // Arrange
        when(customerRepository.existsByNicNumber("199012345678")).thenReturn(false);
        Customer savedCustomer = new Customer();
        savedCustomer.setId(1L);
        savedCustomer.setName(requestDTO.getName());
        savedCustomer.setNicNumber(requestDTO.getNicNumber());
        savedCustomer.setDateOfBirth(requestDTO.getDateOfBirth());
        when(customerRepository.save(any(Customer.class))).thenReturn(savedCustomer);

        // Act
        CustomerResponseDTO response = customerService.createCustomer(requestDTO);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("John Doe", response.getName());
        verify(customerRepository, times(1)).save(any(Customer.class));
    }

    @Test
    void testCreateCustomer_DuplicateNic() {
        // Arrange
        when(customerRepository.existsByNicNumber("199012345678")).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateNicException.class, () -> customerService.createCustomer(requestDTO));
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void testUpdateCustomer_Success() {
        // Arrange
        Customer existing = new Customer();
        existing.setId(1L);
        existing.setName("Old Name");
        existing.setNicNumber("oldNic");

        when(customerRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(customerRepository.existsByNicNumberAndIdNot("199012345678", 1L)).thenReturn(false);

        Customer saved = new Customer();
        saved.setId(1L);
        saved.setName(requestDTO.getName());
        saved.setNicNumber(requestDTO.getNicNumber());
        saved.setDateOfBirth(requestDTO.getDateOfBirth());
        when(customerRepository.save(any(Customer.class))).thenReturn(saved);

        // Act
        CustomerResponseDTO response = customerService.updateCustomer(1L, requestDTO);

        // Assert
        assertNotNull(response);
        assertEquals("John Doe", response.getName());
        verify(customerRepository, times(1)).save(any(Customer.class));
    }
}
