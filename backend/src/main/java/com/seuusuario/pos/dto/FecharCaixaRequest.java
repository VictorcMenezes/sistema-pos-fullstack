package com.seuusuario.pos.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record FecharCaixaRequest(
    @NotNull @DecimalMin("0.00") BigDecimal valorFechamento,
    String observacoes
) {}
