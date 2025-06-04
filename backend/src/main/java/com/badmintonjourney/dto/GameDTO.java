package com.badmintonjourney.dto;

import com.badmintonjourney.entity.Game;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class GameDTO {
    private Long id;
    
    @NotNull(message = "局数不能为空")
    private Integer gameNumber;
    
    @NotBlank(message = "比分不能为空")
    private String score;
    
    private Game.GameResult result;
    
    private List<String> videos; // 多个视频路径
    
    private String coachComment;
    private String selfSummary;
    private Long matchId;
} 