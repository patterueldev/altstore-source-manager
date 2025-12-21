package com.altstoresource.api

import com.altstoresource.domain.App
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class CreateAppRequestDto(
    val name: String,
    val bundleIdentifier: String,
    val developerName: String,
    val subtitle: String? = null,
    val iconURL: String? = null
)

data class UpdateAppRequestDto(
    val name: String? = null,
    val developerName: String? = null,
    val subtitle: String? = null,
    val iconURL: String? = null
)

@RestController
class AdminSourceAppsController {

    @GetMapping("/admin/sources/{sourceId}/apps")
    fun listApps(@PathVariable sourceId: String): ResponseEntity<List<App>> = ResponseEntity.ok(emptyList())

    @PostMapping("/admin/sources/{sourceId}/apps")
    fun createApp(@PathVariable sourceId: String, @RequestBody req: CreateAppRequestDto): ResponseEntity<App> =
        ResponseEntity.status(201).body(
            App(name = req.name, bundleIdentifier = req.bundleIdentifier, developerName = req.developerName, subtitle = req.subtitle, iconURL = req.iconURL)
        )

    @GetMapping("/admin/sources/{sourceId}/apps/{bundleId}")
    fun getApp(@PathVariable sourceId: String, @PathVariable bundleId: String): ResponseEntity<App> =
        ResponseEntity.ok(App(name = "Sample", bundleIdentifier = bundleId, developerName = "Dev"))

    @PutMapping("/admin/sources/{sourceId}/apps/{bundleId}")
    fun updateApp(@PathVariable sourceId: String, @PathVariable bundleId: String, @RequestBody req: UpdateAppRequestDto): ResponseEntity<App> =
        ResponseEntity.ok(App(name = req.name ?: "Sample", bundleIdentifier = bundleId, developerName = req.developerName ?: "Dev", subtitle = req.subtitle, iconURL = req.iconURL))

    @DeleteMapping("/admin/sources/{sourceId}/apps/{bundleId}")
    fun deleteApp(@PathVariable sourceId: String, @PathVariable bundleId: String): ResponseEntity<Void> = ResponseEntity.noContent().build()
}
