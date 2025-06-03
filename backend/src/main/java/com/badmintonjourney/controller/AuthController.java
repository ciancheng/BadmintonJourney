package com.badmintonjourney.controller;

import com.badmintonjourney.dto.JwtResponse;
import com.badmintonjourney.dto.LoginRequest;
import com.badmintonjourney.dto.RegisterRequest;
import com.badmintonjourney.entity.User;
import com.badmintonjourney.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        User user = authService.registerUser(registerRequest);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "用户注册成功");
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        
        return ResponseEntity.ok(response);
    }
} 