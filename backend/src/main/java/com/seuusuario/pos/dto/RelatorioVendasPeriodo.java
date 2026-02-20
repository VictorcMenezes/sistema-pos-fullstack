package com.seuusuario.pos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RelatorioVendasPeriodo(
    LocalDate data,
    BigDecimal totalVendas,
    Long quantidadeVendas
) {}