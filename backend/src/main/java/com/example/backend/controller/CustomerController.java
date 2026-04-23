package com.example.backend.controller;

import com.example.backend.dto.CustomerRequestDTO;
import com.example.backend.dto.CustomerResponseDTO;
import com.example.backend.dto.CustomerSummaryDTO;
import com.example.backend.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    /** POST /api/customers — create */
    @PostMapping
    public ResponseEntity<CustomerResponseDTO> create(@Valid @RequestBody CustomerRequestDTO dto) {
        CustomerResponseDTO created = customerService.createCustomer(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** PUT /api/customers/{id} — update */
    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequestDTO dto) {
        return ResponseEntity.ok(customerService.updateCustomer(id, dto));
    }

    /** GET /api/customers/{id} — view one */
    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomer(id));
    }

    /** GET /api/customers?page=0&size=20&search= — paginated list */
    @GetMapping
    public ResponseEntity<Page<CustomerSummaryDTO>> getAll(
            @RequestParam(defaultValue = "")  String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "id"));
        return ResponseEntity.ok(customerService.getCustomers(search, pageable));
    }

    /** GET /api/customers/search?query= — typeahead for family picker */
    @GetMapping("/search")
    public ResponseEntity<List<CustomerSummaryDTO>> search(
            @RequestParam String query) {
        return ResponseEntity.ok(customerService.search(query));
    }
}
