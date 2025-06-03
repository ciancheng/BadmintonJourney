package com.badmintonjourney.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;

@Entity
@Table(name = "games")
@Data
@EqualsAndHashCode(callSuper = true)
public class Game extends BaseEntity {
    
    @Column(nullable = false)
    private Integer gameNumber; // 第几局
    
    @Column(nullable = false, length = 20)
    private String score; // 小比分，如 "21:19"
    
    @Column(length = 500)
    private String videoPath;
    
    @Column(columnDefinition = "TEXT")
    private String coachComment;
    
    @Column(columnDefinition = "TEXT")
    private String selfSummary;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;
} 