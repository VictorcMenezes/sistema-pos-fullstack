package com.seuusuario.pos.entity;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "estoques")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Estoque {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "produto_id", nullable = false, unique = true)
    private Produto produto;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false)
    private Integer estoqueMinimo = 0;
}
