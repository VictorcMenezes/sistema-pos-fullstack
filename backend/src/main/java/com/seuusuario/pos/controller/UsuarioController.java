package com.seuusuario.pos.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seuusuario.pos.entity.Usuario;
import com.seuusuario.pos.repository.UsuarioRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {

    private final UsuarioRepository repo;

    public UsuarioController(UsuarioRepository repo){
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Usuario u) {
        //Validação de presença: Email OU telefone deve ter conteúdo
        boolean emailEmBranco = u.getEmail() == null || u.getEmail().isBlank();
        boolean telefoneEmBranco = u.getTelefone() == null || u.getTelefone().isBlank();


        if(emailEmBranco && telefoneEmBranco) {
            return ResponseEntity.badRequest()
                .body("Email ou telefone de ser informado");
        }
        //Validação email
        if(u.getEmail() !=null && repo.existsByEmail(u.getEmail())) {
            return ResponseEntity.badRequest()
                .body("Email já cadastrado");
        }

        //validação telefone
        if(u.getTelefone() !=null && repo.existsByTelefone(u.getTelefone())){
            return ResponseEntity.badRequest()
                .body("Telefone já existe");
        }

        Usuario saved =  repo.save(u);
        return ResponseEntity.created(URI.create("/api/v1/usuarios/" + saved.getId()))
            .body(saved);

        
    }
    @GetMapping
    public List<Usuario> list(){
        return repo.findAll();
    }

}
