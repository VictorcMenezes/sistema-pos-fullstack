package com.seuusuario.pos.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.seuusuario.pos.dto.RelatorioFormaPagamento;
import com.seuusuario.pos.dto.ProdutoVendidoDTO;
import com.seuusuario.pos.entity.Venda;

public interface VendaRepository extends JpaRepository<Venda, Long> {

       List<Venda> findByDataVendaBetween(Instant inicio, Instant fim);

       @Query("SELECT SUM(v.valorFinal) FROM Venda v WHERE v.dataVenda BETWEEN :inicio AND :fim")
       BigDecimal somarVendasEntre(@Param("inicio") Instant inicio, @Param("fim") Instant fim);

       @Query("SELECT COUNT(v) FROM Venda v WHERE v.dataVenda BETWEEN :inicio AND :fim")
       Long contarVendasEntre(@Param("inicio") Instant inicio, @Param("fim") Instant fim);

       @Query("SELECT new com.seuusuario.pos.dto.RelatorioFormaPagamento(v.formaPagamento, SUM(v.valorFinal), COUNT(v)) "
                     +
                     "FROM Venda v WHERE v.dataVenda BETWEEN :inicio AND :fim " +
                     "GROUP BY v.formaPagamento")
       List<RelatorioFormaPagamento> relatorioFormaPagamento(@Param("inicio") Instant inicio,
                     @Param("fim") Instant fim);

       @Query("SELECT new com.seuusuario.pos.dto.ProdutoVendidoDTO(p.nome, SUM(iv.quantidade), SUM(iv.subtotal)) " +
                     "FROM ItemVenda iv " +
                     "JOIN iv.produto p " +
                     "JOIN iv.venda v " +
                     "WHERE v.dataVenda BETWEEN :inicio AND :fim " +
                     "GROUP BY p.nome " +
                     "ORDER BY SUM(iv.quantidade) DESC")
       List<ProdutoVendidoDTO> buscarProdutosMaisVendidos(@Param("inicio") Instant inicio, @Param("fim") Instant fim);

       @Query("SELECT COALESCE(SUM(v.valorFinal), 0) FROM Venda v WHERE v.dataVenda BETWEEN :inicio AND :fim")
       BigDecimal somaTotalVendasNoPeriodo(@Param("inicio") Instant inicio, @Param("fim") Instant fim);

       @Query("SELECT COUNT(v) FROM Venda v WHERE v.dataVenda BETWEEN :inicio AND :fim")
       Long contarVendasNoPeriodo(@Param("inicio") Instant inicio, @Param("fim") Instant fim);

       @Query("SELECT COALESCE(SUM(i.quantidade), 0) FROM Venda v JOIN v.itens i WHERE v.dataVenda BETWEEN :inicio AND :fim")
       Long contarItensVendidosNoPeriodo(@Param("inicio") Instant inicio, @Param("fim") Instant fim);

       @Query("SELECT v FROM Venda v WHERE v.dataVenda BETWEEN :inicio AND :fim ORDER BY v.dataVenda DESC")
       List<Venda> listarVendasRecentes(LocalDateTime inicio, LocalDateTime fim);

}