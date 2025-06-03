package com.badmintonjourney.service;

import com.badmintonjourney.dto.CompetitionDTO;
import com.badmintonjourney.entity.Competition;
import com.badmintonjourney.entity.User;
import com.badmintonjourney.repository.CompetitionRepository;
import com.badmintonjourney.repository.UserRepository;
import com.badmintonjourney.security.CustomUserDetails;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CompetitionService {
    
    @Autowired
    private CompetitionRepository competitionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }
    
    @Transactional
    public Competition createCompetition(CompetitionDTO competitionDTO) {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        Competition competition = new Competition();
        BeanUtils.copyProperties(competitionDTO, competition, "id", "photos");
        competition.setUser(user);
        
        return competitionRepository.save(competition);
    }
    
    @Transactional
    public Competition updateCompetition(Long id, CompetitionDTO competitionDTO) {
        Long userId = getCurrentUserId();
        Competition competition = competitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("比赛不存在"));
        
        if (!competition.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权修改此比赛");
        }
        
        BeanUtils.copyProperties(competitionDTO, competition, "id", "user", "matches", "photos");
        
        if (competitionDTO.getPhotos() != null) {
            competition.setPhotos(competitionDTO.getPhotos());
        }
        
        return competitionRepository.save(competition);
    }
    
    @Transactional(readOnly = true)
    public Competition getCompetition(Long id) {
        Long userId = getCurrentUserId();
        Competition competition = competitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("比赛不存在"));
        
        if (!competition.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权查看此比赛");
        }
        
        return competition;
    }
    
    @Transactional(readOnly = true)
    public Page<Competition> getUserCompetitions(Pageable pageable) {
        Long userId = getCurrentUserId();
        return competitionRepository.findByUserIdOrderByStartDateDesc(userId, pageable);
    }
    
    @Transactional
    public void deleteCompetition(Long id) {
        Long userId = getCurrentUserId();
        Competition competition = competitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("比赛不存在"));
        
        if (!competition.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权删除此比赛");
        }
        
        // Delete associated photos
        if (competition.getPhotos() != null) {
            for (String photo : competition.getPhotos()) {
                fileStorageService.deleteFile(photo);
            }
        }
        
        competitionRepository.delete(competition);
    }
    
    @Transactional
    public Competition addPhotos(Long id, List<String> photoPaths) {
        Long userId = getCurrentUserId();
        Competition competition = competitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("比赛不存在"));
        
        if (!competition.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权修改此比赛");
        }
        
        competition.getPhotos().addAll(photoPaths);
        return competitionRepository.save(competition);
    }
} 