package com.badmintonjourney.dto;

import com.badmintonjourney.entity.Competition;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

@Data
public class CompetitionDTO {
    private Long id;
    
    @NotBlank(message = "比赛名称不能为空")
    private String competitionName;
    
    @NotNull(message = "开始日期不能为空")
    private LocalDate startDate;
    
    @NotNull(message = "结束日期不能为空")
    private LocalDate endDate;
    
    @NotBlank(message = "比赛城市不能为空")
    private String city;
    
    private String venue;
    private Competition.CompetitionResult result;
    private List<String> photos;
    private String coachComment;
    private String selfSummary;
    private Long userId;
    private Integer matchCount;
} 