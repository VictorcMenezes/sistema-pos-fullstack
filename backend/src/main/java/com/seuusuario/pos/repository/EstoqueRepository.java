package com.seuusuario.pos.repository;

import com.seuusuario.pos.entity.Estoque;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;


public interface EstoqueRepository extends JpaRepository<Estoque, Long> {
    Optional<Estoque> findByProdutoId(Long produtoId);
}


