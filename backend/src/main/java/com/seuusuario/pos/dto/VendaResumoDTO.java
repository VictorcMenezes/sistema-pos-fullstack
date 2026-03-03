package com.seuusuario.pos.dto;

import java.math.BigDecimal;

public record VendaResumoDTO(
    Long id,
    java.time.Instant dataCriacao,
    BigDecimal total,
    String formaPagamento
) {}