package com.seuusuario.pos.controller;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seuusuario.pos.entity.Caixa;
import com.seuusuario.pos.entity.Usuario;
import com.seuusuario.pos.repository.CaixaRepository;
import com.seuusuario.pos.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/caixas")
@RequiredArgsConstructor
public class CaixaController {
    private final CaixaRepository repo;
    private final UsuarioRepository userRepo;

   @PostMapping("/abrir")
    public ResponseEntity<?> abrir(@RequestBody Map<String, Object> payload, java.security.Principal principal) {
        
        String email = principal.getName(); 
        
        
        Usuario user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário logado não encontrado no banco!"));

        
        Caixa caixa = Caixa.builder()
                .usuario(user)
                .valorAbertura(new BigDecimal(payload.get("valor").toString()))
                .status("ABERTO")
                .dataAbertura(Instant.now())
                .build();
                
        return ResponseEntity.ok(repo.save(caixa));
    }
}
