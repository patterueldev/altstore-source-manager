package com.altstoresource.api

import com.altstoresource.domain.*
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
class SourceController {

    @GetMapping("/health")
    fun health(): Map<String, String> = mapOf("status" to "ok")

    @GetMapping("/source.json")
    fun source(): Source {
        val sampleVersion = AppVersion(
            version = "1.0",
            date = LocalDate.parse("2025-01-01"),
            downloadURL = "https://example.com/MyApp.ipa"
        )
        val sampleApp = App(
            name = "My App",
            bundleIdentifier = "com.example.app",
            developerName = "Example Dev",
            versions = listOf(sampleVersion)
        )
        return Source(
            name = "My Source",
            identifier = "com.example.source",
            apps = listOf(sampleApp)
        )
    }
}
