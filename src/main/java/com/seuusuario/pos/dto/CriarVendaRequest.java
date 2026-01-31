package com.seuusuario.pos.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record CriarVendaRequest(
    @NotNull Long caixaId,
    @NotNull Long usuarioId,
    @NotEmpty List<ItemVendaRequest> itens,
    @NotBlank String formaPagamento
) {}
