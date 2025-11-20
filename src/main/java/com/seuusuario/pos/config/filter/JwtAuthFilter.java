package com.seuusuario.pos.config.filter;
import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull; // Usaremos este @NonNull do Spring para compatibilidade

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
    private final UserDetailsService uds;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        // Isso ignora todas as rotas que começam com /api/v1/auth/, como /login e /register
        return request.getRequestURI().startsWith("/api/v1/auth/");
    }

  
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
        try { username = jwt.extractUsername(token); } catch (Exception e) { }

       
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails user = uds.loadUserByUsername(username);
            if (jwt.isValid(token, user)) {
                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        
      
        chain.doFilter(request, response);
    }
}