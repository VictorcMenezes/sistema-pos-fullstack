package com.seuusuario.pos.dto;

import java.math.BigDecimal;

public record ItemVendaDTO(
    String nomeProduto,
    Integer quantidade,
    BigDecimal precoUnitario
) {}