package com.example.backend.service;

import com.example.backend.dto.BulkUploadResultDTO;
import com.example.backend.entity.Customer;
import com.example.backend.repository.CustomerRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BulkUploadServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private BulkUploadService bulkUploadService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(bulkUploadService, "batchSize", 2);
        lenient().when(customerRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    private void waitForAsync(String jobId) throws InterruptedException {
        int retries = 100;
        while (retries-- > 0) {
            BulkUploadResultDTO job = bulkUploadService.getJobStatus(jobId).orElse(null);
            if (job != null && (job.getStatus().equals("COMPLETED") || job.getStatus().equals("FAILED"))) {
                return;
            }
            Thread.sleep(50);
        }
    }

    @Test
    void submitJob_success_createsCustomers() throws IOException, InterruptedException {
        MockMultipartFile file = excelFile(new String[][] {
                { "Alice", "1990-01-01", "199012345678" },
                { "Bob", "1988-05-02", "198805021V" }
        });
        when(customerRepository.findByNicNumberIn(anyCollection())).thenReturn(Collections.emptyList());

        String jobId = bulkUploadService.submitJob(file);
        waitForAsync(jobId);

        BulkUploadResultDTO result = bulkUploadService.getJobStatus(jobId).orElseThrow(AssertionError::new);
        assertEquals("COMPLETED", result.getStatus());
        assertEquals(2, result.getProcessed());
        assertEquals(0, result.getFailed());
        assertEquals(2, result.getTotal());
        verify(customerRepository, times(1)).saveAll(any());
    }

    @Test
    void submitJob_duplicateNicInFile_marksOneFailed() throws IOException, InterruptedException {
        MockMultipartFile file = excelFile(new String[][] {
                { "Alice", "1990-01-01", "199012345678" },
                { "Alice Duplicate", "1992-01-01", "199012345678" }
        });
        when(customerRepository.findByNicNumberIn(anyCollection())).thenReturn(Collections.emptyList());

        String jobId = bulkUploadService.submitJob(file);
        waitForAsync(jobId);

        BulkUploadResultDTO result = bulkUploadService.getJobStatus(jobId).orElseThrow(AssertionError::new);
        assertEquals("COMPLETED", result.getStatus());
        assertEquals(1, result.getProcessed());
        assertEquals(1, result.getFailed());
        assertEquals(2, result.getTotal());
        assertTrue(result.getErrors().stream().anyMatch(e -> e.getMessage().contains("Duplicate NIC in file")));
    }

    @Test
    void submitJob_existingNic_updatesExistingCustomer() throws IOException, InterruptedException {
        Customer existing = new Customer();
        existing.setId(10L);
        existing.setName("Old Name");
        existing.setDateOfBirth(LocalDate.of(1980, 1, 1));
        existing.setNicNumber("199012345678");

        when(customerRepository.findByNicNumberIn(anyCollection())).thenAnswer(invocation -> {
            Collection<String> nics = invocation.getArgument(0);
            return nics.contains("199012345678") ? Collections.singletonList(existing) : Collections.emptyList();
        });

        MockMultipartFile file = excelFile(new String[][] {
                { "Updated Name", "1991-03-04", "199012345678" }
        });

        String jobId = bulkUploadService.submitJob(file);
        waitForAsync(jobId);

        BulkUploadResultDTO result = bulkUploadService.getJobStatus(jobId).orElseThrow(AssertionError::new);
        assertEquals("COMPLETED", result.getStatus());
        assertEquals(1, result.getProcessed());
        assertEquals(0, result.getFailed());
        verify(customerRepository, times(1)).saveAll(any());
        assertNotNull(existing.getId());
        assertEquals("Updated Name", existing.getName());
        assertEquals(LocalDate.of(1991, 3, 4), existing.getDateOfBirth());
        assertEquals("199012345678", existing.getNicNumber());
    }

    @Test
    void submitJob_invalidRow_marksFailedAndSkipsPersistence() throws IOException, InterruptedException {
        MockMultipartFile file = excelFile(new String[][] {
                { "Alice", "", "199012345678" }
        });

        String jobId = bulkUploadService.submitJob(file);
        waitForAsync(jobId);

        BulkUploadResultDTO result = bulkUploadService.getJobStatus(jobId).orElseThrow(AssertionError::new);
        assertEquals("COMPLETED", result.getStatus());
        assertEquals(0, result.getProcessed());
        assertEquals(1, result.getFailed());
        assertEquals(1, result.getTotal());
        assertTrue(result.getErrors().stream().anyMatch(e -> e.getMessage().contains("Missing mandatory field")));
    }

    @Test
    void submitJob_largeFile_flushesInBatches() throws IOException, InterruptedException {
        MockMultipartFile file = excelFile(new String[][] {
                { "A", "1990-01-01", "199012345678" },
                { "B", "1990-01-02", "199012345679" },
                { "C", "1990-01-03", "199012345670" },
                { "D", "1990-01-04", "199012345671" },
                { "E", "1990-01-05", "199012345672" }
        });
        when(customerRepository.findByNicNumberIn(anyCollection())).thenReturn(Collections.emptyList());

        String jobId = bulkUploadService.submitJob(file);
        waitForAsync(jobId);

        BulkUploadResultDTO result = bulkUploadService.getJobStatus(jobId).orElseThrow(AssertionError::new);
        assertEquals("COMPLETED", result.getStatus());
        assertEquals(5, result.getProcessed());
        assertEquals(0, result.getFailed());
        verify(customerRepository, times(3)).saveAll(any());
    }

    private MockMultipartFile excelFile(String[][] rows) throws IOException {
        byte[] content = buildWorkbook(rows);
        return new MockMultipartFile(
                "file",
                "customers.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                content);
    }

    private byte[] buildWorkbook(String[][] rows) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XSSFSheet sheet = workbook.createSheet("customers");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("name");
            header.createCell(1).setCellValue("dateOfBirth");
            header.createCell(2).setCellValue("nicNumber");

            for (int i = 0; i < rows.length; i++) {
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(rows[i][0]);
                row.createCell(1).setCellValue(rows[i][1]);
                row.createCell(2).setCellValue(rows[i][2]);
            }
            workbook.write(out);
            return out.toByteArray();
        }
    }
}
