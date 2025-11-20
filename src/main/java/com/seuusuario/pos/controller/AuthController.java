package com.seuusuario.pos.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seuusuario.pos.dto.AuthRequest;
import com.seuusuario.pos.dto.AuthResponse;
import com.seuusuario.pos.dto.RefreshRequest;
import com.seuusuario.pos.dto.RegisterRequest;
import com.seuusuario.pos.entity.Usuario;
import com.seuusuario.pos.repository.UsuarioRepository;
import com.seuusuario.pos.service.JwtService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor

public class AuthController {
    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authenticationManager; // exposto via config
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (repo.existsByEmail(req.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email já cadastrado"));
        }
        var user = Usuario.builder()
                .nome(req.nome())
                .email(req.email())
                .senha(encoder.encode(req.senha()))
                .role(req.role().toUpperCase())
                .ativo(true)
                .build();
        repo.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req) {
        var authToken = new UsernamePasswordAuthenticationToken(req.email(), req.senha());
        authenticationManager.authenticate(authToken);

        var user = repo.findByEmail(req.email()).orElseThrow();
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getSenha(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );

        String access = jwtService.generateAccessToken(userDetails);
        String refresh = jwtService.generateRefreshToken(userDetails);
        return ResponseEntity.ok(new AuthResponse(access, refresh));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        String username = jwtService.extractUsername(req.refreshToken());
        var user = repo.findByEmail(username).orElseThrow();
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getSenha(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
        // Aqui, valide também expiração e lista de revogação se implementar logout server-side
        String access = jwtService.generateAccessToken(userDetails);
        return ResponseEntity.ok(new AuthResponse(access, req.refreshToken()));
    }
}
