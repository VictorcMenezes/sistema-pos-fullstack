package com.seuusuario.pos.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.seuusuario.pos.dto.RelatorioFormaPagamento;
import com.seuusuario.pos.dto.ResumoDiaDTO;
import com.seuusuario.pos.dto.ResumoVendas;
import com.seuusuario.pos.dto.TopProdutoDTO;
import com.seuusuario.pos.dto.VendaResumoDTO;
import com.seuusuario.pos.entity.ItemVenda;
import com.seuusuario.pos.entity.Venda;
import com.seuusuario.pos.repository.VendaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RelatorioService {

    private final VendaRepository vendaRepo;

    public ResumoVendas resumoVendas(LocalDate dataInicio, LocalDate dataFim, String formaPagamento) {
        
        Instant inicioFiltro = (dataInicio != null) ? dataInicio.atStartOfDay().toInstant(ZoneOffset.UTC) 
                                                    : LocalDate.now().atStartOfDay().toInstant(ZoneOffset.UTC);
    
        Instant fimFiltro = (dataFim != null) ? dataFim.atTime(23, 59, 59).toInstant(ZoneOffset.UTC) 
                                              : Instant.now();

        Instant inicioSemana = Instant.now().minus(7, ChronoUnit.DAYS);
        Instant inicioMes = Instant.now().minus(30, ChronoUnit.DAYS);

        BigDecimal totalDia = vendaRepo.somarVendasEntre(inicioFiltro, fimFiltro);
        Long qtdDia = vendaRepo.contarVendasEntre(inicioFiltro, fimFiltro);
        
        BigDecimal totalSemana = vendaRepo.somarVendasEntre(inicioSemana, Instant.now());
        BigDecimal totalMes = vendaRepo.somarVendasEntre(inicioMes, Instant.now());

        List<Venda> vendasNoPeriodo = vendaRepo.findByDataVendaBetween(inicioFiltro, fimFiltro);
        
        BigDecimal totalFiltrado = vendasNoPeriodo.stream()
                .filter(v -> formaPagamento == null || formaPagamento.isEmpty()
                        || formaPagamento.equalsIgnoreCase("Todas")
                        || v.getFormaPagamento().equalsIgnoreCase(formaPagamento))
                .map(Venda::getValorFinal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ResumoVendas(totalDia, totalSemana, totalMes, qtdDia, totalFiltrado);
    }
    public List<TopProdutoDTO> getTopProdutos(LocalDate dataInicio, LocalDate dataFim, Integer limite) {
        Instant inicio = (dataInicio != null) ? dataInicio.atStartOfDay().toInstant(ZoneOffset.UTC)
                : Instant.now().minus(30, ChronoUnit.DAYS);
        Instant fim = (dataFim != null) ? dataFim.atTime(23, 59, 59).toInstant(ZoneOffset.UTC) : Instant.now();

        return vendaRepo.findByDataVendaBetween(inicio, fim)
                .stream()
                .flatMap(v -> v.getItens().stream())
                .collect(Collectors.groupingBy(item -> item.getProduto(),
                        Collectors.summingInt(ItemVenda::getQuantidade)))
                .entrySet().stream()
                .map(entry -> {
                    var produto = entry.getKey();
                    Integer qtd = entry.getValue();
                    double total = qtd * produto.getPrecoVenda().doubleValue();
                    return new TopProdutoDTO(produto.getId(), produto.getNome(), qtd, total);
                })
                .sorted(Comparator.comparing(TopProdutoDTO::getQuantidadeVendida).reversed())
                .limit(limite != null ? limite : 5)
                .collect(Collectors.toList());
    }

    public ResumoDiaDTO obterResumoDiaCompleto() {
        LocalDate hoje = LocalDate.now();
       
        Instant inicioDia = hoje.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant fimDia = hoje.atTime(23, 59, 59).toInstant(ZoneOffset.UTC);

      
        ResumoVendas resumoBase = this.resumoVendas(hoje, hoje, "Todas");

       
        List<TopProdutoDTO> top = this.getTopProdutos(hoje, hoje, 999);
        Long totalItensHoje = top.stream()
                .mapToLong(p -> p.getQuantidadeVendida().longValue())
                .sum();

        
        BigDecimal ticketMedio = BigDecimal.ZERO;
        if (resumoBase.qtdDia() != null && resumoBase.qtdDia() > 0) {
                ticketMedio = resumoBase.totalDia().divide(BigDecimal.valueOf(resumoBase.qtdDia()), java.math.RoundingMode.HALF_UP);
        }

        
        List<VendaResumoDTO> ultimas = vendaRepo.findByDataVendaBetween(inicioDia, fimDia).stream()
                .sorted(Comparator.comparing(Venda::getDataVenda).reversed())
                .limit(5)
                .map(v -> new VendaResumoDTO(
                        v.getId(), 
                        v.getDataVenda(), 
                        v.getValorFinal(), 
                        v.getFormaPagamento()))
                .collect(Collectors.toList());

        return new ResumoDiaDTO(
                resumoBase.totalDia(),
                resumoBase.qtdDia(),
                totalItensHoje,
                ticketMedio,
                ultimas
        );
        }

    public List<RelatorioFormaPagamento> vendasPorFormaPagamento(Instant inicio, Instant fim) {
        return vendaRepo.relatorioFormaPagamento(inicio, fim);
    }
}