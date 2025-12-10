package com.seuusuario.pos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seuusuario.pos.entity.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    boolean existsByCodigoBarras(String codigoBarras);
}

