package com.seuusuario.pos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO para receber dados de registro de um novo usuário.
 */

public record RegisterRequest(
    @NotBlank String nome,
    @Email String email,
    @NotBlank String senha,
    @NotBlank String role
) {}