package com.badmintonjourney.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonBackReference;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "games")
@Data
@EqualsAndHashCode(callSuper = true)
public class Game extends BaseEntity {
    
    @Column(nullable = false)
    private Integer gameNumber; // 第几局
    
    @Column(nullable = false, length = 20)
    private String score; // 小比分，如 "21:19"
    
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private GameResult result; // 局比赛结果
    
    @ElementCollection
    @CollectionTable(name = "game_videos", joinColumns = @JoinColumn(name = "game_id"))
    @Column(name = "video_path")
    private List<String> videos = new ArrayList<>();
    
    @Column(columnDefinition = "TEXT")
    private String coachComment;
    
    @Column(columnDefinition = "TEXT")
    private String selfSummary;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    @JsonBackReference("match-games")
    private Match match;
    
    public enum GameResult {
        WIN("胜"),
        LOSE("负");
        
        private final String displayName;
        
        GameResult(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
} 