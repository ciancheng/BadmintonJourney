package com.badmintonjourney.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "competitions")
@Data
@EqualsAndHashCode(callSuper = true)
public class Competition extends BaseEntity {
    
    @Column(nullable = false, length = 100)
    private String competitionName;
    
    @Column(nullable = false)
    private LocalDate startDate;
    
    @Column(nullable = false)
    private LocalDate endDate;
    
    @Column(nullable = false, length = 50)
    private String city;
    
    @Column(length = 200)
    private String venue;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CompetitionResult result;
    
    @ElementCollection
    @CollectionTable(name = "competition_photos", joinColumns = @JoinColumn(name = "competition_id"))
    @Column(name = "photo_path")
    private List<String> photos = new ArrayList<>();
    
    @Column(columnDefinition = "TEXT")
    private String coachComment;
    
    @Column(columnDefinition = "TEXT")
    private String selfSummary;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-competitions")
    private User user;
    
    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("competition-matches")
    private List<Match> matches = new ArrayList<>();
    
    public enum CompetitionResult {
        GROUP_NOT_QUALIFIED("小组未出线"),
        GROUP_QUALIFIED("小组出线"),
        TOP_32("32强"),
        TOP_16("16强"),
        TOP_8("8强"),
        TOP_4("4强"),
        THIRD_PLACE("第三名"),
        SECOND_PLACE("第二名"),
        CHAMPION("冠军");
        
        private final String displayName;
        
        CompetitionResult(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
} 