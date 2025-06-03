package com.badmintonjourney.controller;

import com.badmintonjourney.dto.MatchDTO;
import com.badmintonjourney.entity.Match;
import com.badmintonjourney.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/matches")
public class MatchController {
    
    @Autowired
    private MatchService matchService;
    
    @GetMapping("/competition/{competitionId}")
    public ResponseEntity<?> getCompetitionMatches(@PathVariable Long competitionId) {
        List<Match> matches = matchService.getCompetitionMatches(competitionId);
        return ResponseEntity.ok(matches);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getMatch(@PathVariable Long id) {
        Match match = matchService.getMatch(id);
        return ResponseEntity.ok(match);
    }
    
    @PostMapping
    public ResponseEntity<?> createMatch(@Valid @RequestBody MatchDTO matchDTO) {
        Match match = matchService.createMatch(matchDTO);
        return ResponseEntity.ok(match);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMatch(
            @PathVariable Long id,
            @Valid @RequestBody MatchDTO matchDTO) {
        Match match = matchService.updateMatch(id, matchDTO);
        return ResponseEntity.ok(match);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMatch(@PathVariable Long id) {
        matchService.deleteMatch(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "对战删除成功");
        return ResponseEntity.ok(response);
    }
} 