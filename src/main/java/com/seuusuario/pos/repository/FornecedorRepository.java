package com.seuusuario.pos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seuusuario.pos.entity.Fornecedor;

public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> {
    boolean existsByCnpj(String cnpj);
}