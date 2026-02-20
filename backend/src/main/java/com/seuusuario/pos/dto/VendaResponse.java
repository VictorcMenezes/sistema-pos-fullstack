package com.seuusuario.pos.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record VendaResponse(
    Long id,
    String numeroVenda,
    BigDecimal valorTotal,
    BigDecimal valorFinal,
    String formaPagamento,
    Instant dataVenda
) {}