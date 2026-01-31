package com.seuusuario.pos.config.filter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

import com.seuusuario.pos.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request, 
            @NonNull HttpServletResponse response, 
            @NonNull FilterChain chain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }
        
        String token = authHeader.substring(7);
        String username = null;
        
        try { 
            username = jwt.extractUsername(token); 
        } catch (Exception e) { 
            // Token inválido ou expirado
        }

        
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            List<SimpleGrantedAuthority> authorities = jwt.extractAuthorities(token)
                .stream()
                .map(auth -> {
                    String role = auth.getAuthority();
                    return new SimpleGrantedAuthority(role.startsWith("ROLE_") ? role : "ROLE_" + role);
                })
                .collect(Collectors.toList());

            System.out.println("Autoridades normalizadas: " + authorities);

            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(username, null, authorities);
            
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
                
        chain.doFilter(request, response);
    }
}