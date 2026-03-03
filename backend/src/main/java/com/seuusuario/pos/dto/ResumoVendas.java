package com.seuusuario.pos.dto;

import java.math.BigDecimal;

public record ResumoVendas(
    BigDecimal totalDia,
    BigDecimal totalSemana,
    BigDecimal totalMes,
    Long qtdDia,
    BigDecimal totalFiltrado
) {}