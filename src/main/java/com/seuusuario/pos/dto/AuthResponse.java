package com.seuusuario.pos.dto;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    Long id,
    String nome,
    String role
) {
    
    public AuthResponse(String accessToken, String refreshToken) {
        this(accessToken, refreshToken, null, null, null);
    }
}