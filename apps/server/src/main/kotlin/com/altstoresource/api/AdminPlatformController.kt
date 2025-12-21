package com.altstoresource.api

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class SourceAdminDto(val id: String, val name: String)
data class CreateSourceRequestDto(val name: String)
data class UpdateSourceRequestDto(val name: String?)

data class UserDto(val id: String, val email: String)
data class CreateUserRequestDto(val email: String, val password: String)

data class MembershipDto(val userId: String, val sourceId: String, val roles: List<String>)
data class CreateMembershipRequestDto(val userId: String, val sourceId: String, val roles: List<String>)

@RestController
class AdminPlatformController {

    @GetMapping("/admin/sources")
    fun listSources(): ResponseEntity<List<SourceAdminDto>> = ResponseEntity.ok(emptyList())

    @PostMapping("/admin/sources")
    fun createSource(@RequestBody req: CreateSourceRequestDto): ResponseEntity<SourceAdminDto> =
        ResponseEntity.status(201).body(SourceAdminDto(id = "default", name = req.name))

    @GetMapping("/admin/sources/{sourceId}")
    fun getSourceAdmin(@PathVariable sourceId: String): ResponseEntity<SourceAdminDto> =
        ResponseEntity.ok(SourceAdminDto(id = sourceId, name = "Sample"))

    @PutMapping("/admin/sources/{sourceId}")
    fun updateSource(@PathVariable sourceId: String, @RequestBody req: UpdateSourceRequestDto): ResponseEntity<SourceAdminDto> =
        ResponseEntity.ok(SourceAdminDto(id = sourceId, name = req.name ?: "Sample"))

    @DeleteMapping("/admin/sources/{sourceId}")
    fun deleteSource(@PathVariable sourceId: String): ResponseEntity<Void> = ResponseEntity.noContent().build()

    @GetMapping("/admin/users")
    fun listUsers(): ResponseEntity<List<UserDto>> = ResponseEntity.ok(emptyList())

    @PostMapping("/admin/users")
    fun createUser(@RequestBody req: CreateUserRequestDto): ResponseEntity<UserDto> =
        ResponseEntity.status(201).body(UserDto(id = "user1", email = req.email))

    @PostMapping("/admin/memberships")
    fun assignUser(@RequestBody req: CreateMembershipRequestDto): ResponseEntity<MembershipDto> =
        ResponseEntity.status(201).body(MembershipDto(userId = req.userId, sourceId = req.sourceId, roles = req.roles))

    @DeleteMapping("/admin/memberships")
    fun removeUser(@RequestParam userId: String, @RequestParam sourceId: String): ResponseEntity<Void> =
        ResponseEntity.noContent().build()
}
