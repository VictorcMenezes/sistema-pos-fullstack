package com.seuusuario.pos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "caixas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Caixa {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false)
    private BigDecimal valorAbertura;

    private BigDecimal valorFechamento;

    @Column(nullable = false)
    private Instant dataAbertura = Instant.now();

    private Instant dataFechamento;

    @Column(nullable = false, length = 20)
    private String status; // ABERTO, FECHADO
}
