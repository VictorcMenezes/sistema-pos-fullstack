package com.seuusuario.pos.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.seuusuario.pos.dto.RelatorioFormaPagamento;
import com.seuusuario.pos.dto.ResumoVendas;
import com.seuusuario.pos.repository.VendaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RelatorioService {

    private final VendaRepository vendaRepo;

    public ResumoVendas resumoVendas() {
        Instant agora = Instant.now();
        Instant inicioDia = agora.truncatedTo(ChronoUnit.DAYS);
        Instant inicioSemana = agora.minus(7, ChronoUnit.DAYS);
        Instant inicioMes = agora.minus(30, ChronoUnit.DAYS);

        BigDecimal totalDia = Optional.ofNullable(vendaRepo.somarVendasEntre(inicioDia, agora))
                .orElse(BigDecimal.ZERO);
        BigDecimal totalSemana = Optional.ofNullable(vendaRepo.somarVendasEntre(inicioSemana, agora))
                .orElse(BigDecimal.ZERO);
        BigDecimal totalMes = Optional.ofNullable(vendaRepo.somarVendasEntre(inicioMes, agora))
                .orElse(BigDecimal.ZERO);
        Long qtdDia = vendaRepo.contarVendasEntre(inicioDia, agora);

        return new ResumoVendas(totalDia, totalSemana, totalMes, qtdDia);
    }

    public List<RelatorioFormaPagamento> vendasPorFormaPagamento(Instant inicio, Instant fim) {
        return vendaRepo.relatorioFormaPagamento(inicio, fim);
    }
}
