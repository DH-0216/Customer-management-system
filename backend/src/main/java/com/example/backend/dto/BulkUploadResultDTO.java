package com.example.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkUploadResultDTO {

    private String jobId;
    private String status;   // PENDING | PROCESSING | COMPLETED | FAILED
    private int total;
    private int processed;
    private int failed;

    @Builder.Default
    private List<RowError> errors = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RowError {
        private int row;
        private String message;
    }
}
