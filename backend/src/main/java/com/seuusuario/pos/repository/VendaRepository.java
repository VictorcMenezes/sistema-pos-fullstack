package com.seuusuario.pos.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.seuusuario.pos.dto.RelatorioFormaPagamento;
import com.seuusuario.pos.entity.Venda;

public interface VendaRepository extends JpaRepository<Venda, Long> {

    // Total de vendas em um periodo (entre datas)
    @Query("SELECT SUM(v.valorFinal) FROM Venda v WHERE v.dataVenda BETWEEN :inicio AND :fim")
    BigDecimal somarVendasEntre(@Param("inicio") Instant inicio, @Param("fim") Instant fim);

    // Contar vendas em periodo
    @Query("SELECT COUNT(v) FROM Venda v WHERE v.dataVenda BETWEEN :inicio AND :fim")
    Long contarVendasEntre(@Param("inicio") Instant inicio, @Param("fim") Instant fim);

    // Vendas agrupadas por forma de pagamento
    @Query("SELECT new com.seuusuario.pos.dto.RelatorioFormaPagamento(v.formaPagamento, SUM(v.valorFinal), COUNT(v)) " +
           "FROM Venda v WHERE v.dataVenda BETWEEN :inicio AND :fim " +
           "GROUP BY v.formaPagamento")
    List<RelatorioFormaPagamento> relatorioFormaPagamento(@Param("inicio") Instant inicio, @Param("fim") Instant fim);
}
