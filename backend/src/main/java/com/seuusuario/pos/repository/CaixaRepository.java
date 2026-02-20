package com.seuusuario.pos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seuusuario.pos.entity.Caixa;

public interface CaixaRepository extends JpaRepository<Caixa, Long> {

    Optional<Caixa> findFirstByUsuarioIdAndStatusOrderByDataAberturaDesc(Long usuarioId, String status);
}