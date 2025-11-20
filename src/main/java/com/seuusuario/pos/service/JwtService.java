package com.seuusuario.pos.service;

import java.security.Key;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.stream.Collectors; // Se usar o collect(Collectors.toList())

@Service
public class JwtService {
    @Value("${security.jwt.secret}") private String secret; // base64
    @Value("${security.jwt.access-ttl-seconds}") private long accessTtl;
    @Value("${security.jwt.refresh-ttl-seconds}") private long refreshTtl;

    private Key key() { return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)); }

    public String generateAccessToken(UserDetails user) {
        return Jwts.builder()
            .setSubject(user.getUsername())
            .claim("roles", user.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList())
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
        return Jwts.parserBuilder().setSigningKey(key()).build()
            .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean isValid(String token, UserDetails user) {
        final String username = extractUsername(token);
        return username.equals(user.getUsername()) && !isExpired(token);
    }

    private boolean isExpired(String token) {
        Date exp = Jwts.parserBuilder().setSigningKey(key()).build()
            .parseClaimsJws(token).getBody().getExpiration();
        return exp.before(new Date());
    }
}
