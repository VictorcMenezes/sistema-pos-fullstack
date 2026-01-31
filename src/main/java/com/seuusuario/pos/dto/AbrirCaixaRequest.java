package com.seuusuario.pos.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record AbrirCaixaRequest(
    @NotNull Long usuarioId,
    @NotNull @DecimalMin("0.00") BigDecimal valorAbertura
) {}
