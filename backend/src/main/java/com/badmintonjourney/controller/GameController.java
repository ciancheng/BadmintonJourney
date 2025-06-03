package com.badmintonjourney.controller;

import com.badmintonjourney.dto.GameDTO;
import com.badmintonjourney.entity.Game;
import com.badmintonjourney.service.FileStorageService;
import com.badmintonjourney.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/games")
public class GameController {
    
    @Autowired
    private GameService gameService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @GetMapping("/match/{matchId}")
    public ResponseEntity<?> getMatchGames(@PathVariable Long matchId) {
        List<Game> games = gameService.getMatchGames(matchId);
        return ResponseEntity.ok(games);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getGame(@PathVariable Long id) {
        Game game = gameService.getGame(id);
        return ResponseEntity.ok(game);
    }
    
    @PostMapping
    public ResponseEntity<?> createGame(@Valid @RequestBody GameDTO gameDTO) {
        Game game = gameService.createGame(gameDTO);
        return ResponseEntity.ok(game);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateGame(
            @PathVariable Long id,
            @Valid @RequestBody GameDTO gameDTO) {
        Game game = gameService.updateGame(id, gameDTO);
        return ResponseEntity.ok(game);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGame(@PathVariable Long id) {
        gameService.deleteGame(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "局删除成功");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/video")
    public ResponseEntity<?> uploadVideo(
            @PathVariable Long id,
            @RequestParam("video") MultipartFile video) {
        
        String videoPath = fileStorageService.storeFile(video, "videos");
        Game game = gameService.updateVideo(id, videoPath);
        return ResponseEntity.ok(game);
    }
} 