package com.badmintonjourney.controller;

import com.badmintonjourney.dto.CompetitionDTO;
import com.badmintonjourney.entity.Competition;
import com.badmintonjourney.service.CompetitionService;
import com.badmintonjourney.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/competitions")
public class CompetitionController {
    
    @Autowired
    private CompetitionService competitionService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @GetMapping
    public ResponseEntity<?> getUserCompetitions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Competition> competitions = competitionService.getUserCompetitions(pageable);
        return ResponseEntity.ok(competitions);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getCompetition(@PathVariable Long id) {
        Competition competition = competitionService.getCompetition(id);
        return ResponseEntity.ok(competition);
    }
    
    @PostMapping
    public ResponseEntity<?> createCompetition(@Valid @RequestBody CompetitionDTO competitionDTO) {
        CompetitionDTO createdCompetition = competitionService.createCompetition(competitionDTO);
        return ResponseEntity.ok(createdCompetition);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCompetition(
            @PathVariable Long id,
            @Valid @RequestBody CompetitionDTO competitionDTO) {
        Competition competition = competitionService.updateCompetition(id, competitionDTO);
        return ResponseEntity.ok(competition);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCompetition(@PathVariable Long id) {
        competitionService.deleteCompetition(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "比赛删除成功");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/photos")
    public ResponseEntity<?> uploadPhotos(
            @PathVariable Long id,
            @RequestParam("photos") MultipartFile[] photos) {
        
        List<String> photoPaths = new ArrayList<>();
        for (MultipartFile photo : photos) {
            String path = fileStorageService.storeFile(photo, "photos");
            photoPaths.add(path);
        }
        
        Competition competition = competitionService.addPhotos(id, photoPaths);
        return ResponseEntity.ok(competition);
    }
    
    @DeleteMapping("/{id}/photos")
    public ResponseEntity<?> deletePhoto(
            @PathVariable Long id,
            @RequestParam("photoPath") String photoPath) {
        
        Competition competition = competitionService.removePhoto(id, photoPath);
        Map<String, String> response = new HashMap<>();
        response.put("message", "照片删除成功");
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}/photos/batch")
    public ResponseEntity<?> deletePhotos(
            @PathVariable Long id,
            @RequestBody List<String> photoPaths) {
        
        Competition competition = competitionService.removePhotos(id, photoPaths);
        Map<String, String> response = new HashMap<>();
        response.put("message", String.format("成功删除%d张照片", photoPaths.size()));
        return ResponseEntity.ok(response);
    }
} 