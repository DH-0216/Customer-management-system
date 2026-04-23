package com.example.backend.repository;

import com.example.backend.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    boolean existsByNicNumber(String nicNumber);

    boolean existsByNicNumberAndIdNot(String nicNumber, Long id);

    Optional<Customer> findByNicNumber(String nicNumber);

    List<Customer> findByNicNumberIn(Collection<String> nicNumbers);

    @Query("SELECT c FROM Customer c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.nicNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Customer> findByNameOrNicContaining(@Param("search") String search, Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.nicNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Customer> searchByNameOrNic(@Param("query") String query, Pageable pageable);
}
