package com.badmintonjourney.service;

import com.badmintonjourney.dto.MatchDTO;
import com.badmintonjourney.entity.Competition;
import com.badmintonjourney.entity.Match;
import com.badmintonjourney.repository.CompetitionRepository;
import com.badmintonjourney.repository.MatchRepository;
import com.badmintonjourney.security.CustomUserDetails;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MatchService {
    
    @Autowired
    private MatchRepository matchRepository;
    
    @Autowired
    private CompetitionRepository competitionRepository;
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }
    
    @Transactional
    public Match createMatch(MatchDTO matchDTO) {
        Long userId = getCurrentUserId();
        Competition competition = competitionRepository.findById(matchDTO.getCompetitionId())
                .orElseThrow(() -> new RuntimeException("比赛不存在"));
        
        if (!competition.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权在此比赛中添加对战");
        }
        
        Match match = new Match();
        BeanUtils.copyProperties(matchDTO, match, "id", "competitionId");
        match.setCompetition(competition);
        match.setMatchTime(java.time.LocalDateTime.now());
        
        return matchRepository.save(match);
    }
    
    @Transactional
    public Match updateMatch(Long id, MatchDTO matchDTO) {
        Long userId = getCurrentUserId();
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("对战不存在"));
        
        if (!match.getCompetition().getUser().getId().equals(userId)) {
            throw new RuntimeException("无权修改此对战");
        }
        
        BeanUtils.copyProperties(matchDTO, match, "id", "competition", "games", "competitionId");
        
        return matchRepository.save(match);
    }
    
    @Transactional(readOnly = true)
    public MatchDTO getMatch(Long id) {
        Long userId = getCurrentUserId();
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("对战不存在"));
        
        if (!match.getCompetition().getUser().getId().equals(userId)) {
            throw new RuntimeException("无权查看此对战");
        }
        
        return convertToDTO(match);
    }
    
    @Transactional(readOnly = true)
    public List<Match> getCompetitionMatches(Long competitionId) {
        Long userId = getCurrentUserId();
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new RuntimeException("比赛不存在"));
        
        if (!competition.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权查看此比赛的对战");
        }
        
        return matchRepository.findByCompetitionIdOrderByCreatedAt(competitionId);
    }
    
    @Transactional
    public void deleteMatch(Long id) {
        Long userId = getCurrentUserId();
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("对战不存在"));
        
        if (!match.getCompetition().getUser().getId().equals(userId)) {
            throw new RuntimeException("无权删除此对战");
        }
        
        matchRepository.delete(match);
    }
    
    private MatchDTO convertToDTO(Match match) {
        MatchDTO dto = new MatchDTO();
        dto.setId(match.getId());
        dto.setMatchType(match.getMatchType());
        dto.setOpponentName(match.getOpponentName());
        dto.setOpponentCity(match.getOpponentCity());
        dto.setScore(match.getScore());
        dto.setResult(match.getResult());
        dto.setCoachComment(match.getCoachComment());
        dto.setSelfSummary(match.getSelfSummary());
        if (match.getCompetition() != null) {
            dto.setCompetitionId(match.getCompetition().getId());
        }
        if (match.getGames() != null) {
            dto.setGameCount(match.getGames().size());
        }
        return dto;
    }
} 