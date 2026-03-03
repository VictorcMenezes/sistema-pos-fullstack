package com.seuusuario.pos.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter @AllArgsConstructor
public class ProdutoVendidoDTO {
    private String nome;
    private Long quantidade;
    private BigDecimal totalGerado;
}