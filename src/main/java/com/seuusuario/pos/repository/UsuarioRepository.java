package com.seuusuario.pos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.seuusuario.pos.entity.Usuario;
import java.util.Optional;


public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByTelefone(String telefone);
    boolean existsByEmail(String email);
    boolean existsByTelefone(String telefone);

    //metodo para busca por email ou telefone
     @Query("SELECT u FROM Usuario u WHERE u.email = :identificador OR u.telefone = :identificador")
    Optional<Usuario> findByEmailOrTelefone(@Param("identificador") String identificador);




}
