package com.seuusuario.pos.controller;
import com.seuusuario.pos.dto.MovimentacaoEstoqueRequest;
import com.seuusuario.pos.entity.MovimentacaoEstoque;
import com.seuusuario.pos.service.EstoqueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/estoque")
@RequiredArgsConstructor
public class EstoqueController {

    private final EstoqueService service;

    @PostMapping("/movimentar")
    @PreAuthorize("hasAnyRole('ADMIN', 'FUNCIONARIO')") 
    public ResponseEntity<?> movimentar(@Valid @RequestBody MovimentacaoEstoqueRequest req) {
        service.movimentar(req);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/historico/{produtoId}")
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<List<MovimentacaoEstoque>> historico(@PathVariable Long produtoId) {
        return ResponseEntity.ok(service.historico(produtoId));
    }
}