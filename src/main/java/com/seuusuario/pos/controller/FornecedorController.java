package com.seuusuario.pos.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.seuusuario.pos.dto.FornecedorDTO;
import com.seuusuario.pos.service.FornecedorService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/fornecedores")
@RequiredArgsConstructor
public class FornecedorController {
    private final FornecedorService service;

    @PostMapping
    public ResponseEntity<FornecedorDTO> criar(@Valid @RequestBody FornecedorDTO dto){
        FornecedorDTO salvo = service.salvar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @GetMapping
    public List<FornecedorDTO> lista(){
        return service.lista();
    }

    @PutMapping("/{id}")
    public FornecedorDTO atualizar(@PathVariable Long id, @Valid @RequestBody FornecedorDTO dto){
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id){
        service.deletar(id);
    }
}
