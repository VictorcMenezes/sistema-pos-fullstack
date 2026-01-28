package com.seuusuario.pos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.seuusuario.pos.entity.enums.TipoMovimentacao;

@Entity
@Table(name = "movimentacoes_estoque")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MovimentacaoEstoque {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "produto_id")
    private Produto produto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoMovimentacao tipo; // ENTRADA / SAIDA / AJUSTE

    @Column(nullable = false)
    private Integer quantidade;

    @Column(length = 255)
    private String motivo;

    @Column(nullable = false)
    private Instant dataMovimentacao = Instant.now();
}
