package com.badmintonjourney.service;

import com.badmintonjourney.dto.GameDTO;
import com.badmintonjourney.entity.Game;
import com.badmintonjourney.entity.Match;
import com.badmintonjourney.repository.GameRepository;
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
public class GameService {
    
    @Autowired
    private GameRepository gameRepository;
    
    @Autowired
    private MatchRepository matchRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }
    
    @Transactional
    public Game createGame(GameDTO gameDTO) {
        Long userId = getCurrentUserId();
        Match match = matchRepository.findById(gameDTO.getMatchId())
                .orElseThrow(() -> new RuntimeException("对战不存在"));
        
        if (!match.getCompetition().getUser().getId().equals(userId)) {
            throw new RuntimeException("无权在此对战中添加局");
        }
        
        Game game = new Game();
        BeanUtils.copyProperties(gameDTO, game, "id", "matchId");
        game.setMatch(match);
        
        return gameRepository.save(game);
    }
    
    @Transactional
    public Game updateGame(Long id, GameDTO gameDTO) {
        Long userId = getCurrentUserId();
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("局不存在"));
        
        if (!game.getMatch().getCompetition().getUser().getId().equals(userId)) {
            throw new RuntimeException("无权修改此局");
        }
        
        BeanUtils.copyProperties(gameDTO, game, "id", "match", "matchId", "videoPath");
        
        // Don't overwrite video path unless explicitly provided
        if (gameDTO.getVideoPath() != null) {
            // Delete old video if exists
            if (game.getVideoPath() != null && !game.getVideoPath().equals(gameDTO.getVideoPath())) {
                fileStorageService.deleteFile(game.getVideoPath());
            }
            game.setVideoPath(gameDTO.getVideoPath());
        }
        
        return gameRepository.save(game);
    }
    
    @Transactional(readOnly = true)
    public Game getGame(Long id) {
        Long userId = getCurrentUserId();
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("局不存在"));
        
        if (!game.getMatch().getCompetition().getUser().getId().equals(userId)) {
            throw new RuntimeException("无权查看此局");
        }
        
        return game;
    }
    
    @Transactional(readOnly = true)
    public List<Game> getMatchGames(Long matchId) {
        Long userId = getCurrentUserId();
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("对战不存在"));
        
        if (!match.getCompetition().getUser().getId().equals(userId)) {
            throw new RuntimeException("无权查看此对战的局");
        }
        
        return gameRepository.findByMatchIdOrderByGameNumber(matchId);
    }
    
    @Transactional
    public void deleteGame(Long id) {
        Long userId = getCurrentUserId();
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("局不存在"));
        
        if (!game.getMatch().getCompetition().getUser().getId().equals(userId)) {
            throw new RuntimeException("无权删除此局");
        }
        
        // Delete associated video if exists
        if (game.getVideoPath() != null) {
            fileStorageService.deleteFile(game.getVideoPath());
        }
        
        gameRepository.delete(game);
    }
    
    @Transactional
    public Game updateVideo(Long id, String videoPath) {
        Long userId = getCurrentUserId();
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("局不存在"));
        
        if (!game.getMatch().getCompetition().getUser().getId().equals(userId)) {
            throw new RuntimeException("无权修改此局");
        }
        
        // Delete old video if exists
        if (game.getVideoPath() != null) {
            fileStorageService.deleteFile(game.getVideoPath());
        }
        
        game.setVideoPath(videoPath);
        return gameRepository.save(game);
    }
} 