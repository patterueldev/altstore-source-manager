package com.altstoresource.api

import com.altstoresource.domain.*
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
class PublicSourcesController {

    @GetMapping("/sources/{sourceId}")
    fun getSource(@PathVariable sourceId: String): ResponseEntity<Source> {
        // Placeholder: return sample data
        val version = AppVersion(
            version = "1.0.0",
            date = LocalDate.parse("2025-01-01"),
            localizedDescription = "Initial release",
            downloadURL = "https://example.com/MyApp-1.0.0.ipa",
            size = 50_000_000,
            minOSVersion = "14.0",
            sha256 = "abc123def456"
        )
        val app = App(
            name = "Sample App",
            bundleIdentifier = "com.example.app",
            developerName = "Example Dev",
            versions = listOf(version)
        )
        val source = Source(
            name = "Sample Source ($sourceId)",
            identifier = "com.example.source",
            apps = listOf(app)
        )
        return ResponseEntity.ok(source)
    }

    @GetMapping("/sources/{sourceId}/apps")
    fun listApps(@PathVariable sourceId: String): ResponseEntity<List<App>> {
        // Placeholder: return minimal list
        val app = App(
            name = "Sample App",
            bundleIdentifier = "com.example.app",
            developerName = "Example Dev"
        )
        return ResponseEntity.ok(listOf(app))
    }

    @GetMapping("/sources/{sourceId}/apps/{bundleId}/{version}")
    fun getVersion(
        @PathVariable sourceId: String,
        @PathVariable bundleId: String,
        @PathVariable version: String
    ): ResponseEntity<AppVersion> {
        // Placeholder: return minimal version info
        val v = AppVersion(
            version = version,
            date = LocalDate.parse("2025-01-01"),
            localizedDescription = "Placeholder",
            downloadURL = "https://example.com/$bundleId/$version.ipa"
        )
        return ResponseEntity.ok(v)
    }
}
