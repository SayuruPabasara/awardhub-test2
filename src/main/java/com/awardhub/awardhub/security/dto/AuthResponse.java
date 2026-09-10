package com.awardhub.awardhub.security.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String email;
    private String role;
    private Long userId;
    private String message;
}
