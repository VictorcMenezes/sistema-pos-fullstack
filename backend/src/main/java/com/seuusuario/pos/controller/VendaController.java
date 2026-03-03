package com.seuusuario.pos.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seuusuario.pos.dto.CriarVendaRequest;
import com.seuusuario.pos.dto.VendaResponse;
import com.seuusuario.pos.service.VendaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/vendas")
@RequiredArgsConstructor
public class VendaController {

    private final VendaService vendaService;

    @PostMapping
    public ResponseEntity<VendaResponse> criar(@Valid @RequestBody CriarVendaRequest req) {
        VendaResponse resp = vendaService.criarVenda(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @GetMapping
    public ResponseEntity<List<VendaResponse>> listar(
            @RequestParam(required = false) String dataInicio,
            @RequestParam(required = false) String dataFim,
            @RequestParam(required = false) String formaPagamento) {
        
        // Chame o método correspondente no seu VendaService
        List<VendaResponse> vendas = vendaService.buscarComFiltros(dataInicio, dataFim, formaPagamento);
        return ResponseEntity.ok(vendas);
    }
}