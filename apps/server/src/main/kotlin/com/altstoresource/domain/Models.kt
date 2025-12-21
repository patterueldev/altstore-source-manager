package com.altstoresource.domain

import com.fasterxml.jackson.annotation.JsonInclude
import java.time.LocalDate

@JsonInclude(JsonInclude.Include.NON_NULL)
data class Source(
    val name: String,
    val identifier: String,
    val apps: List<App> = emptyList()
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class App(
    val name: String,
    val bundleIdentifier: String,
    val developerName: String,
    val subtitle: String? = null,
    val iconURL: String? = null,
    val versions: List<AppVersion> = emptyList()
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class AppVersion(
    val version: String,
    val date: LocalDate,
    val localizedDescription: String? = null,
    val downloadURL: String? = null,
    val size: Long? = null,
    val minOSVersion: String? = null,
    val sha256: String? = null
)
