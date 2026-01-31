package com.seuusuario.pos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seuusuario.pos.entity.Venda;

public interface VendaRepository extends JpaRepository<Venda, Long> {}