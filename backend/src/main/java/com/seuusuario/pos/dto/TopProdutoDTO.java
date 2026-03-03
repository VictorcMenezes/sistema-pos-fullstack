package com.seuusuario.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopProdutoDTO {
    private Long produtoId;
    private String nome;
    private Integer quantidadeVendida;
    private Double totalVendido;
}