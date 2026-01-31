package com.seuusuario.pos.dto;

import java.math.BigDecimal;

public record ResumoVendas(
    BigDecimal totalVendasDia,
    BigDecimal totalVendasSemana,
    BigDecimal totalVendasMes,
    Long quantidadeVendasDia
) {}