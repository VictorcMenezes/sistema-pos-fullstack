package com.seuusuario.pos.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record CriarVendaRequest(
    Long caixaId,
    Long usuarioId,
    String formaPagamento,
    BigDecimal desconto,
    List<ItemVendaRequest> itens
) {}