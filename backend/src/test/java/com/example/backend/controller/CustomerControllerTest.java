package com.example.backend.controller;

import com.example.backend.dto.CustomerRequestDTO;
import com.example.backend.dto.CustomerResponseDTO;
import com.example.backend.service.CustomerService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CustomerController.class)
public class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CustomerService customerService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createCustomer_ValidRequest_ReturnsCreated() throws Exception {
        CustomerRequestDTO request = new CustomerRequestDTO();
        request.setName("Alice");
        request.setNicNumber("199012345v");
        request.setDateOfBirth(LocalDate.of(1990, 5, 5));

        CustomerResponseDTO response = new CustomerResponseDTO();
        response.setId(1L);
        response.setName("Alice");
        response.setNicNumber("199012345v");

        when(customerService.createCustomer(any(CustomerRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Alice"));
    }

    @Test
    void createCustomer_InvalidNic_ReturnsBadRequest() throws Exception {
        CustomerRequestDTO request = new CustomerRequestDTO();
        request.setName("Alice");
        request.setNicNumber("invalidNic"); // invalid format
        request.setDateOfBirth(LocalDate.of(1990, 5, 5));

        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.nicNumber").exists());
    }
}
