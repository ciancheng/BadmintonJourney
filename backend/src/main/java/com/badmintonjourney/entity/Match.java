package com.badmintonjourney.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "matches")
@Data
@EqualsAndHashCode(callSuper = true)
public class Match extends BaseEntity {
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MatchType matchType;
    
    @Column(nullable = false, length = 50)
    private String opponentName;
    
    @Column(nullable = false, length = 50)
    private String opponentCity;
    
    @Column(length = 20)
    private String score; // 大比分，如 "2:1"
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private MatchResult result;
    
    @Column(columnDefinition = "TEXT")
    private String coachComment;
    
    @Column(columnDefinition = "TEXT")
    private String selfSummary;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;
    
    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Game> games = new ArrayList<>();
    
    public enum MatchType {
        GROUP_STAGE("小组赛"),
        KNOCKOUT_1("淘汰赛1"),
        KNOCKOUT_2("淘汰赛2"),
        KNOCKOUT_3("淘汰赛3"),
        KNOCKOUT_4("淘汰赛4"),
        KNOCKOUT_5("淘汰赛5");
        
        private final String displayName;
        
        MatchType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum MatchResult {
        WIN("胜"),
        LOSE("负");
        
        private final String displayName;
        
        MatchResult(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
} 