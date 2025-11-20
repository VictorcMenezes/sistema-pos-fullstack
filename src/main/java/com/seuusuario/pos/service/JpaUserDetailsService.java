package com.seuusuario.pos.service;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.seuusuario.pos.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JpaUserDetailsService implements UserDetailsService {
    private final UsuarioRepository repo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var u = repo.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole()));
        return new org.springframework.security.core.userdetails.User(
            u.getEmail(), u.getSenha(), u.getAtivo(), true, true, true, authorities
        );
    }
}

