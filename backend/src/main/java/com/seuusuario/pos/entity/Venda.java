package com.seuusuario.pos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "vendas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Venda {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "caixa_id")
    private Caixa caixa;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false, unique = true, length = 50)
    private String numeroVenda;

    @Column(nullable = false)
    private BigDecimal valorTotal;

    @Column(nullable = false)
    private BigDecimal valorFinal;

    @Column(length = 50)
    private String formaPagamento; // DINHEIRO, CARTAO_CREDITO...

    @Column(nullable = false)
    private Instant dataVenda = Instant.now();

    @OneToMany(mappedBy = "venda", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemVenda> itens = new ArrayList<>();
}
