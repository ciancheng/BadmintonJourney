package com.badmintonjourney.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity {
    
    @Column(nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(unique = true, length = 20)
    private String phoneNumber;
    
    @Column(nullable = false, length = 100)
    private String email;
    
    @Column(length = 50)
    private String nickname;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Competition> competitions = new ArrayList<>();
    
    @Column(nullable = false)
    private Boolean enabled = true;
} 