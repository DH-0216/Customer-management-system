package com.example.backend.controller;

import com.example.backend.dto.BulkUploadResultDTO;
import com.example.backend.service.BulkUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/customers/bulk-upload")
@RequiredArgsConstructor
public class BulkUploadController {

    private final BulkUploadService bulkUploadService;

    /**
     * POST /api/customers/bulk-upload
     * Accepts multipart Excel file, returns jobId immediately.
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> upload(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", "No file provided"));
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", "No filename provided"));
        }

        String lowerFilename = originalFilename.toLowerCase(Locale.ROOT);
        if (!lowerFilename.endsWith(".xlsx") && !lowerFilename.endsWith(".xls")) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", "Only .xlsx and .xls files are accepted"));
        }

        String jobId = bulkUploadService.submitJob(file);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(Collections.singletonMap("jobId", jobId));
    }

    /**
     * GET /api/customers/bulk-upload/{jobId}
     * Poll job status.
     */
    @GetMapping("/{jobId}")
    public ResponseEntity<BulkUploadResultDTO> getStatus(@PathVariable String jobId) {
        return bulkUploadService.getJobStatus(jobId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
