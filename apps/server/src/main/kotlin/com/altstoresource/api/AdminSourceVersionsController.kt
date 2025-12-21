package com.altstoresource.api

import com.altstoresource.domain.AppVersion
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

data class CreateVersionRequestDto(
    val version: String,
    val date: String,
    val localizedDescription: String? = null,
    val minOSVersion: String? = null,
    val sha256: String? = null
)

data class UpdateVersionRequestDto(
    val date: String? = null,
    val localizedDescription: String? = null,
    val minOSVersion: String? = null,
    val sha256: String? = null
)

@RestController
class AdminSourceVersionsController {

    @GetMapping("/admin/sources/{sourceId}/apps/{bundleId}/versions")
    fun listVersions(@PathVariable sourceId: String, @PathVariable bundleId: String): ResponseEntity<List<AppVersion>> =
        ResponseEntity.ok(emptyList())

    @PostMapping("/admin/sources/{sourceId}/apps/{bundleId}/versions")
    fun createVersion(
        @PathVariable sourceId: String,
        @PathVariable bundleId: String,
        @RequestBody req: CreateVersionRequestDto
    ): ResponseEntity<AppVersion> {
        val v = AppVersion(
            version = req.version,
            date = LocalDate.parse(req.date),
            localizedDescription = req.localizedDescription,
            minOSVersion = req.minOSVersion,
            sha256 = req.sha256,
            downloadURL = "https://example.com/$bundleId/${req.version}.ipa"
        )
        return ResponseEntity.status(201).body(v)
    }

    @GetMapping("/admin/sources/{sourceId}/apps/{bundleId}/versions/{version}")
    fun getVersionAdmin(
        @PathVariable sourceId: String,
        @PathVariable bundleId: String,
        @PathVariable version: String
    ): ResponseEntity<AppVersion> = ResponseEntity.ok(
        AppVersion(version = version, date = LocalDate.parse("2025-01-01"))
    )

    @PutMapping("/admin/sources/{sourceId}/apps/{bundleId}/versions/{version}")
    fun updateVersion(
        @PathVariable sourceId: String,
        @PathVariable bundleId: String,
        @PathVariable version: String,
        @RequestBody req: UpdateVersionRequestDto
    ): ResponseEntity<AppVersion> = ResponseEntity.ok(
        AppVersion(
            version = version,
            date = LocalDate.parse(req.date ?: "2025-01-01"),
            localizedDescription = req.localizedDescription,
            minOSVersion = req.minOSVersion,
            sha256 = req.sha256
        )
    )

    @DeleteMapping("/admin/sources/{sourceId}/apps/{bundleId}/versions/{version}")
    fun deleteVersion(@PathVariable sourceId: String, @PathVariable bundleId: String, @PathVariable version: String): ResponseEntity<Void> =
        ResponseEntity.noContent().build()
}
