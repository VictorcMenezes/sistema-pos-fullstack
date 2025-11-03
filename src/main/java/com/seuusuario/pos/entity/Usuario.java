package com.seuusuario.pos.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String nome;

    @Column(unique = true, length = 100)
    private String email; 

    @Column(unique = true, length = 20)
    private String telefone;

    @Column(nullable = false, length = 255)
    private String senha;

    @Column(nullable = false, length = 20)
    private String role; // admin , funcionario

    @Column(nullable = false)
    private Boolean ativo = true; // permiter desativar usuario sem deletar
    
    @Column(nullable = false)
    private Instant criandoEm = Instant.now();// define automaticamente data e hora atual
}
