package com.seuusuario.pos.dto;

public record AuthResponse(
    String accessToken,
    String refreshToken
) {}
