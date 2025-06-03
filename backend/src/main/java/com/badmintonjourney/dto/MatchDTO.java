package com.badmintonjourney.dto;

import com.badmintonjourney.entity.Match;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class MatchDTO {
    private Long id;
    
    @NotNull(message = "比赛类型不能为空")
    private Match.MatchType matchType;
    
    @NotBlank(message = "对手姓名不能为空")
    private String opponentName;
    
    @NotBlank(message = "对手城市不能为空")
    private String opponentCity;
    
    private String score;
    
    @NotNull(message = "比赛结果不能为空")
    private Match.MatchResult result;
    
    private String coachComment;
    private String selfSummary;
    private Long competitionId;
    private Integer gameCount;
} 