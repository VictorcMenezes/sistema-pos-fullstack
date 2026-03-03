package com.seuusuario.pos.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record VendaResponse(
    Long id,
    String numeroVenda,
    BigDecimal valorTotal,
    BigDecimal valorFinal,
    String formaPagamento,
    Instant dataVenda,
    List<ItemVendaDTO> itens
) {}