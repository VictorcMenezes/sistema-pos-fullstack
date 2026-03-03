package com.seuusuario.pos.controller;

import com.seuusuario.pos.dto.ProdutoVendidoDTO;
import com.seuusuario.pos.dto.RelatorioFormaPagamento;
import com.seuusuario.pos.repository.VendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@CrossOrigin("*")
public class DashboardController {

    private final VendaRepository vendaRepository;

    @GetMapping("/resumo")
    public Map<String, Object> getResumo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {

      
        Instant start = inicio.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant end = fim.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

        BigDecimal totalVendas = vendaRepository.somarVendasEntre(start, end);
        Long qtdVendas = vendaRepository.contarVendasEntre(start, end);
        List<ProdutoVendidoDTO> topProdutos = vendaRepository.buscarProdutosMaisVendidos(start, end);
        List<RelatorioFormaPagamento> porForma = vendaRepository.relatorioFormaPagamento(start, end);

      
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVendas", totalVendas != null ? totalVendas : BigDecimal.ZERO);
        stats.put("quantidadeVendas", qtdVendas != null ? qtdVendas : 0);
        stats.put("topProdutos", topProdutos);
        stats.put("vendasPorForma", porForma);

        return stats;
    }
}