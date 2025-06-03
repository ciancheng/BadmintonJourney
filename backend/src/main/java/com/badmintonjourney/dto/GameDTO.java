package com.badmintonjourney.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class GameDTO {
    private Long id;
    
    @NotNull(message = "局数不能为空")
    private Integer gameNumber;
    
    @NotBlank(message = "比分不能为空")
    private String score;
    
    private String videoPath;
    private String coachComment;
    private String selfSummary;
    private Long matchId;
} 