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
    public CompetitionDTO createCompetition(CompetitionDTO competitionDTO) {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        Competition competition = new Competition();
        competition.setCompetitionName(competitionDTO.getCompetitionName());
        competition.setStartDate(competitionDTO.getStartDate());
        competition.setEndDate(competitionDTO.getEndDate());
        competition.setCity(competitionDTO.getCity());
        competition.setVenue(competitionDTO.getVenue());
        competition.setUser(user);
        
        Competition savedCompetition = competitionRepository.save(competition);
        return convertToDTO(savedCompetition);
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
    
    @Transactional
    public Competition removePhoto(Long id, String photoPath) {
        Long userId = getCurrentUserId();
        Competition competition = competitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("比赛不存在"));
        
        if (!competition.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权修改此比赛");
        }
        
        // Remove photo from list
        competition.getPhotos().remove(photoPath);
        
        // Delete the actual file
        fileStorageService.deleteFile(photoPath);
        
        return competitionRepository.save(competition);
    }
    
    @Transactional
    public Competition removePhotos(Long id, List<String> photoPaths) {
        Long userId = getCurrentUserId();
        Competition competition = competitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("比赛不存在"));
        
        if (!competition.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权修改此比赛");
        }
        
        // Remove photos from list
        for (String photoPath : photoPaths) {
            competition.getPhotos().remove(photoPath);
            // Delete the actual file
            fileStorageService.deleteFile(photoPath);
        }
        
        return competitionRepository.save(competition);
    }
    
    private CompetitionDTO convertToDTO(Competition competition) {
        CompetitionDTO dto = new CompetitionDTO();
        dto.setId(competition.getId());
        dto.setCompetitionName(competition.getCompetitionName());
        dto.setStartDate(competition.getStartDate());
        dto.setEndDate(competition.getEndDate());
        dto.setCity(competition.getCity());
        dto.setVenue(competition.getVenue());
        dto.setResult(competition.getResult());
        dto.setPhotos(competition.getPhotos());
        dto.setCoachComment(competition.getCoachComment());
        dto.setSelfSummary(competition.getSelfSummary());
        if (competition.getUser() != null) {
            dto.setUserId(competition.getUser().getId());
        }
        if (competition.getMatches() != null) {
            dto.setMatchCount(competition.getMatches().size());
        }
        return dto;
    }
} 