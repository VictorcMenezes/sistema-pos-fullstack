package com.seuusuario.pos.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.HashMap;


@RestController
@RequestMapping("/api/v1/teste")
public class TesteController {

    @GetMapping("/me")
    public Map<String, Object> testarPermissoes() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> info = new HashMap<>();
        info.put("usuario", auth.getName());
        info.put("permissoes", auth.getAuthorities());
        info.put("autenticado", auth.isAuthenticated());
        return info;
    }

    @GetMapping("/check") 
    public ResponseEntity<?> check() {
        return ResponseEntity.ok(Map.of(
            "status", "Backend está vivo",
            "timestamp", System.currentTimeMillis()
        ));
    }

}
