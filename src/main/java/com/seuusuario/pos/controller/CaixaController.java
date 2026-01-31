package com.seuusuario.pos.controller;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seuusuario.pos.dto.AbrirCaixaRequest;
import com.seuusuario.pos.dto.CaixaResponse;
import com.seuusuario.pos.dto.FecharCaixaRequest;
import com.seuusuario.pos.entity.Caixa;
import com.seuusuario.pos.entity.Usuario;
import com.seuusuario.pos.repository.CaixaRepository;
import com.seuusuario.pos.repository.UsuarioRepository;
import com.seuusuario.pos.service.CaixaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/caixas")
@RequiredArgsConstructor
public class CaixaController {

    private final CaixaService caixaService;

    @PostMapping("/abrir")
    @PreAuthorize("hasAnyRole('ADMIN','FUNCIONARIO')")
    public ResponseEntity<CaixaResponse> abrir(@Valid @RequestBody AbrirCaixaRequest req) {
        CaixaResponse resp = caixaService.abrirCaixa(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PostMapping("/{id}/fechar")
    @PreAuthorize("hasAnyRole('ADMIN','FUNCIONARIO')")
    public ResponseEntity<CaixaResponse> fechar(
            @PathVariable Long id,
            @Valid @RequestBody FecharCaixaRequest req) {
        CaixaResponse resp = caixaService.fecharCaixa(id, req);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/aberto/{usuarioId}")
    @PreAuthorize("hasAnyRole('ADMIN','FUNCIONARIO')")
    public ResponseEntity<CaixaResponse> caixaAberto(@PathVariable Long usuarioId) {
        return caixaService.buscarCaixaAbertoPorUsuario(usuarioId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}