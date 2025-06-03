package com.badmintonjourney.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String phoneNumber;
    private String nickname;
    
    public JwtResponse(String token, Long id, String username, String email, 
                       String phoneNumber, String nickname) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.nickname = nickname;
    }
} 