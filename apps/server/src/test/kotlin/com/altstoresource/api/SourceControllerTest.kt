package com.altstoresource.api

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@WebMvcTest(SourceController::class)
class SourceControllerTest(@Autowired val mockMvc: MockMvc) {

    @Test
    fun health_returns_ok() {
        mockMvc.get("/health")
            .andExpect {
                status { isOk() }
                jsonPath("$.status") { value("ok") }
            }
    }

    @Test
    fun source_returns_sample_structure() {
        mockMvc.get("/source.json")
            .andExpect {
                status { isOk() }
                jsonPath("$.name") { exists() }
                jsonPath("$.identifier") { exists() }
                jsonPath("$.apps") { isArray() }
            }
    }
}
