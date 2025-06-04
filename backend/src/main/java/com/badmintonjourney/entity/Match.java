package com.badmintonjourney.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "matches")
@Data
@EqualsAndHashCode(callSuper = true)
public class Match extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competition_id", nullable = false)
    @JsonBackReference("competition-matches")
    private Competition competition;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MatchType matchType;
    
    @Column(nullable = false, length = 100)
    private String opponentName;
    
    @Column(nullable = false, length = 50)
    private String opponentCity;
    
    @Column(length = 100)
    private String opponentClub;
    
    @Column(nullable = false)
    private LocalDateTime matchTime;
    
    @Column(length = 50)
    private String score;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private MatchResult result;
    
    @Column(columnDefinition = "TEXT")
    private String coachComment;
    
    @Column(columnDefinition = "TEXT")
    private String selfSummary;
    
    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("match-games")
    private List<Game> games = new ArrayList<>();
    
    public enum MatchType {
        GROUP_STAGE("小组赛"),
        GROUP_STAGE_1("小组赛1"),
        GROUP_STAGE_2("小组赛2"),
        GROUP_STAGE_3("小组赛3"),
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