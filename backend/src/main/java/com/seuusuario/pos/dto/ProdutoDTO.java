package com.seuusuario.pos.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProdutoDTO (
    Long id,
    @NotBlank String nome,
    @NotBlank String codigoBarras,
    @NotNull Long fornecedorId,
    @NotNull @DecimalMin("0.01") BigDecimal precoCompra,
    @NotNull @DecimalMin("0.01") BigDecimal precoVenda,
    Boolean ativo,
    Integer quantidadeInicial
)
{}
