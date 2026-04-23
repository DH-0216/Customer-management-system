package com.example.backend.service;

import com.example.backend.dto.BulkUploadResultDTO;
import com.example.backend.entity.Customer;
import com.example.backend.repository.CustomerRepository;
import com.example.backend.util.ExcelStreamingParser;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BulkUploadService {

    private static final Logger log = LoggerFactory.getLogger(BulkUploadService.class);

    private final CustomerRepository customerRepository;

    @Value("${app.bulk.batch-size:500}")
    private int batchSize;

    /**
     * In-memory job store — no DB needed for job status polling.
     * ConcurrentHashMap is thread-safe.
     */
    private final Map<String, BulkUploadResultDTO> jobStore = new ConcurrentHashMap<>();

    // ── Public API ─────────────────────────────────────────────────────────────

    /**
     * Submit the file and return a jobId immediately.
     * Processing happens asynchronously.
     */
    public String submitJob(MultipartFile file) {
        String jobId = UUID.randomUUID().toString();
        BulkUploadResultDTO job = BulkUploadResultDTO.builder()
                .jobId(jobId)
                .status("PENDING")
                .build();
        jobStore.put(jobId, job);
        processAsync(jobId, file);
        return jobId;
    }

    public Optional<BulkUploadResultDTO> getJobStatus(String jobId) {
        return Optional.ofNullable(jobStore.get(jobId));
    }

    // ── Async processing ────────────────────────────────────────────────────────

    @Async("bulkUploadExecutor")
    public void processAsync(String jobId, MultipartFile file) {
        BulkUploadResultDTO job = jobStore.get(jobId);
        job.setStatus("PROCESSING");

        List<BulkUploadResultDTO.RowError> errors = Collections.synchronizedList(new ArrayList<>());
        List<ExcelStreamingParser.ParsedRow> pendingRows = new ArrayList<>(batchSize);
        Set<String> nicsInCurrentBatch = new HashSet<>(); // Track NICs in current batch only
        int[] processed = { 0 };
        int[] failed = { 0 };

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try (InputStream stream = file.getInputStream()) {
            ExcelStreamingParser.parse(stream, parsedRow -> {
                try {
                    // Validate NIC
                    String nic = parsedRow.nicNumber.trim();
                    if (!nic.matches("^[0-9]{9}[vVxX]$|^[0-9]{12}$")) {
                        errors.add(new BulkUploadResultDTO.RowError(parsedRow.rowNum,
                                "Invalid NIC format: " + nic));
                        failed[0]++;
                        return;
                    }

                    // Skip duplicate within file
                    if (!nicsInCurrentBatch.add(nic)) {
                        errors.add(new BulkUploadResultDTO.RowError(parsedRow.rowNum,
                                "Duplicate NIC in file: " + nic));
                        failed[0]++;
                        return;
                    }

                    // Parse date
                    try {
                        LocalDate.parse(parsedRow.dateOfBirth.trim(), dateFormatter);
                    } catch (DateTimeParseException e) {
                        errors.add(new BulkUploadResultDTO.RowError(parsedRow.rowNum,
                                "Invalid date format (expected YYYY-MM-DD): " + parsedRow.dateOfBirth));
                        failed[0]++;
                        return;
                    }

                    pendingRows.add(parsedRow);

                    // Flush batch
                    if (pendingRows.size() >= batchSize) {
                        processed[0] += flushPendingRows(pendingRows, dateFormatter);
                        pendingRows.clear();
                        nicsInCurrentBatch.clear(); // Memory safety: don't accumulate NICs
                        log.debug("Bulk upsert: {} records saved", processed[0]);
                    }
                } catch (Exception e) {
                    errors.add(new BulkUploadResultDTO.RowError(parsedRow.rowNum, e.getMessage()));
                    failed[0]++;
                }
            }, errors);

            // Flush remaining
            if (!pendingRows.isEmpty()) {
                processed[0] += flushPendingRows(pendingRows, dateFormatter);
            }

            int effectiveFailed = Math.max(failed[0], errors.size());
            job.setTotal(processed[0] + effectiveFailed);
            job.setProcessed(processed[0]);
            job.setFailed(effectiveFailed);
            job.setErrors(errors.size() > 500 ? errors.subList(0, 500) : errors);
            job.setStatus("COMPLETED");
            log.info("Bulk upload [{}] done: {} processed, {} failed", jobId, processed[0], effectiveFailed);

        } catch (Exception e) {
            log.error("Bulk upload [{}] failed", jobId, e);
            job.setStatus("FAILED");
            job.getErrors().add(new BulkUploadResultDTO.RowError(0, "Fatal error: " + e.getMessage()));
        }
    }

    private int flushPendingRows(List<ExcelStreamingParser.ParsedRow> rows,
            DateTimeFormatter dateFormatter) {
        Set<String> nicSet = rows.stream()
                .map(r -> r.nicNumber.trim())
                .collect(Collectors.toSet());

        Map<String, Customer> existingByNic = customerRepository.findByNicNumberIn(nicSet)
                .stream()
                .collect(Collectors.toMap(Customer::getNicNumber, c -> c));

        List<Customer> toSave = new ArrayList<>(rows.size());
        for (ExcelStreamingParser.ParsedRow row : rows) {
            String nic = row.nicNumber.trim();
            LocalDate dob = LocalDate.parse(row.dateOfBirth.trim(), dateFormatter);

            Customer customer = existingByNic.get(nic);
            if (customer == null) {
                customer = new Customer();
                customer.setNicNumber(nic);
            }

            customer.setName(row.name.trim());
            customer.setDateOfBirth(dob);
            toSave.add(customer);
        }

        customerRepository.saveAll(toSave);
        return toSave.size();
    }
}
