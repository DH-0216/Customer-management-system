package com.example.backend.repository;

import com.example.backend.dto.CustomerSummaryDTO;
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

       // ── N+1 Optimization: Fetch summary data directly without lazy loading ──
       @Query("SELECT new com.example.backend.dto.CustomerSummaryDTO(" +
                     "c.id, c.name, c.dateOfBirth, c.nicNumber, " +
                     "CAST(COALESCE(COUNT(DISTINCT m.id), 0) AS int), " +
                     "CAST(COALESCE(COUNT(DISTINCT a.id), 0) AS int), " +
                     "CAST(COALESCE(COUNT(DISTINCT f.id), 0) AS int)) " +
                     "FROM Customer c " +
                     "LEFT JOIN c.mobileNumbers m " +
                     "LEFT JOIN c.addresses a " +
                     "LEFT JOIN c.familyMembers f " +
                     "WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(c.nicNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
                     "GROUP BY c.id, c.name, c.dateOfBirth, c.nicNumber")
       Page<CustomerSummaryDTO> findSummaryByNameOrNic(@Param("search") String search, Pageable pageable);

       @Query("SELECT new com.example.backend.dto.CustomerSummaryDTO(" +
                     "c.id, c.name, c.dateOfBirth, c.nicNumber, " +
                     "CAST(COALESCE(COUNT(DISTINCT m.id), 0) AS int), " +
                     "CAST(COALESCE(COUNT(DISTINCT a.id), 0) AS int), " +
                     "CAST(COALESCE(COUNT(DISTINCT f.id), 0) AS int)) " +
                     "FROM Customer c " +
                     "LEFT JOIN c.mobileNumbers m " +
                     "LEFT JOIN c.addresses a " +
                     "LEFT JOIN c.familyMembers f " +
                     "GROUP BY c.id, c.name, c.dateOfBirth, c.nicNumber")
       Page<CustomerSummaryDTO> findAllSummaries(Pageable pageable);

       @Query("SELECT new com.example.backend.dto.CustomerSummaryDTO(" +
                     "c.id, c.name, c.dateOfBirth, c.nicNumber, " +
                     "CAST(COALESCE(COUNT(DISTINCT m.id), 0) AS int), " +
                     "CAST(COALESCE(COUNT(DISTINCT a.id), 0) AS int), " +
                     "CAST(COALESCE(COUNT(DISTINCT f.id), 0) AS int)) " +
                     "FROM Customer c " +
                     "LEFT JOIN c.mobileNumbers m " +
                     "LEFT JOIN c.addresses a " +
                     "LEFT JOIN c.familyMembers f " +
                     "WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                     "LOWER(c.nicNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
                     "GROUP BY c.id, c.name, c.dateOfBirth, c.nicNumber")
       List<CustomerSummaryDTO> searchSummaryByNameOrNic(@Param("query") String query, Pageable pageable);
}
