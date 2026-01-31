package com.seuusuario.pos.dto;

import java.math.BigDecimal;

public record RelatorioFormaPagamento(
    String formaPagamento,
    BigDecimal total,
    Long quantidade
) {}
