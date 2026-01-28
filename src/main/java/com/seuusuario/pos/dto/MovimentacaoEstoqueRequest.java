package com.seuusuario.pos.dto;

import com.seuusuario.pos.entity.enums.TipoMovimentacao;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record MovimentacaoEstoqueRequest(
    @NotNull Long produtoId,
    @NotNull TipoMovimentacao tipo,
    @NotNull @Min(1) Integer quantidade,
    String motivo
) {}
