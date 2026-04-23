package com.example.backend.controller;

import com.example.backend.service.BulkUploadService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BulkUploadController.class)
class BulkUploadControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private BulkUploadService bulkUploadService;

	@Test
	void upload_xlsx_returnsAcceptedWithJobId() throws Exception {
		when(bulkUploadService.submitJob(any())).thenReturn("job-123");

		MockMultipartFile file = new MockMultipartFile(
				"file",
				"customers.xlsx",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"dummy".getBytes()
		);

		mockMvc.perform(multipart("/api/customers/bulk-upload").file(file))
				.andExpect(status().isAccepted())
				.andExpect(jsonPath("$.jobId").value("job-123"));
	}

	@Test
	void upload_xls_returnsBadRequest() throws Exception {
		MockMultipartFile file = new MockMultipartFile(
				"file",
				"customers.xls",
				"application/vnd.ms-excel",
				"dummy".getBytes()
		);

		mockMvc.perform(multipart("/api/customers/bulk-upload").file(file))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.error").value("Only .xlsx files are accepted"));

		verifyNoInteractions(bulkUploadService);
	}

	@Test
	void upload_nonExcel_returnsBadRequest() throws Exception {
		MockMultipartFile file = new MockMultipartFile(
				"file",
				"customers.csv",
				"text/csv",
				"name,dob,nic".getBytes()
		);

		mockMvc.perform(multipart("/api/customers/bulk-upload").file(file))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.error").value("Only .xlsx files are accepted"));

		verifyNoInteractions(bulkUploadService);
	}
}

