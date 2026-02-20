package com.seuusuario.pos.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record CaixaResponse(
    Long id,
    Long usuarioId,
    BigDecimal valorAbertura,
    BigDecimal saldoAtual,
    BigDecimal valorFechamento,
    String status,
    Instant dataAbertura,
    Instant dataFechamento
) {}