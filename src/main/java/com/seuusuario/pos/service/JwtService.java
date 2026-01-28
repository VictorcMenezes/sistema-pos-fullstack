package com.seuusuario.pos.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JwtService {

    @Value("${security.jwt.secret}") 
    private String secret;
    
    @Value("${security.jwt.access-ttl-seconds}") 
    private long accessTtl;
    
    @Value("${security.jwt.refresh-ttl-seconds}") 
    private long refreshTtl;

    private Key key() { 
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)); 
    }

    public List<SimpleGrantedAuthority> extractAuthorities(String token) {
        Claims claims = extractAllClaims(token);
        List<?> roles = claims.get("roles", List.class); 
        if (roles == null) return List.of();
        
        return roles.stream()
                .map(role -> {
                    String r = role.toString();
                    // Remove ROLE_ se já existir para não duplicar
                    if (r.startsWith("ROLE_")) {
                        r = r.substring(5);
                    }
                    return new SimpleGrantedAuthority("ROLE_" + r);
                })
                .collect(Collectors.toList());
    }

   
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String generateAccessToken(UserDetails user) {
        return Jwts.builder()
            .setSubject(user.getUsername())
            .claim("roles", user.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()))
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + accessTtl * 1000))
            .signWith(key(), SignatureAlgorithm.HS256)
            .compact();
    }

    public String generateRefreshToken(UserDetails user) {
        return Jwts.builder()
            .setSubject(user.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + refreshTtl * 1000))
            .signWith(key(), SignatureAlgorithm.HS256)
            .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isValid(String token, UserDetails user) {
        final String username = extractUsername(token);
        return username.equals(user.getUsername()) && !isExpired(token);
    }

    private boolean isExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }
}