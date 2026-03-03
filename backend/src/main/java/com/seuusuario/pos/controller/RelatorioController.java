package com.seuusuario.pos.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seuusuario.pos.dto.ResumoDiaDTO;
import com.seuusuario.pos.dto.ResumoVendas;
import com.seuusuario.pos.dto.TopProdutoDTO;
import com.seuusuario.pos.service.RelatorioService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/relatorios")
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioService relatorioService;

    @GetMapping("/resumo")
    @PreAuthorize("hasAnyRole('ADMIN','FUNCIONARIO')")
    public ResponseEntity<ResumoVendas> resumo(
            @RequestParam(required = false) String dataInicio,
            @RequestParam(required = false) String dataFim,
            @RequestParam(required = false) String formaPagamento) {

        LocalDate inicio = (dataInicio != null && !dataInicio.isEmpty()) ? LocalDate.parse(dataInicio) : null;
        LocalDate fim = (dataFim != null && !dataFim.isEmpty()) ? LocalDate.parse(dataFim) : null;

        return ResponseEntity.ok(relatorioService.resumoVendas(inicio, fim, formaPagamento));
    }

    @GetMapping("/top-produtos")
    @PreAuthorize("hasAnyRole('ADMIN','FUNCIONARIO')")
    public ResponseEntity<List<TopProdutoDTO>> getTopProdutos(
            @RequestParam(required = false) String dataInicio,
            @RequestParam(required = false) String dataFim,
            @RequestParam(defaultValue = "5") Integer limite) {

        LocalDate inicio = (dataInicio != null && !dataInicio.isEmpty()) ? LocalDate.parse(dataInicio) : null;
        LocalDate fim = (dataFim != null && !dataFim.isEmpty()) ? LocalDate.parse(dataFim) : null;

        return ResponseEntity.ok(relatorioService.getTopProdutos(inicio, fim, limite));
    }

    @GetMapping("/resumo-dia")
    @PreAuthorize("hasAnyRole('ADMIN','FUNCIONARIO')")
    public ResponseEntity<ResumoDiaDTO> resumoDia() {
        return ResponseEntity.ok(relatorioService.obterResumoDiaCompleto());
    }
}