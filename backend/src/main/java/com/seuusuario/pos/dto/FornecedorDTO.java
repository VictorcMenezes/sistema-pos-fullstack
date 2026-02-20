package com.seuusuario.pos.dto;

import jakarta.validation.constraints.NotBlank;

public record FornecedorDTO(
    Long id,
    @NotBlank String nome,
    String cnpj,
    String telefone,
    String email,
    Boolean ativo
) {

}
