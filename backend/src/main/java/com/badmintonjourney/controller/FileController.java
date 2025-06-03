package com.badmintonjourney.controller;

import com.badmintonjourney.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/uploads")
public class FileController {
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @GetMapping("/{type}/{filename:.+}")
    public ResponseEntity<byte[]> getFile(
            @PathVariable String type,
            @PathVariable String filename) {
        
        String filePath = type + "/" + filename;
        byte[] fileContent = fileStorageService.loadFileAsBytes(filePath);
        
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (type.equals("photos")) {
            String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
            switch (extension) {
                case "jpg":
                case "jpeg":
                    mediaType = MediaType.IMAGE_JPEG;
                    break;
                case "png":
                    mediaType = MediaType.IMAGE_PNG;
                    break;
                case "gif":
                    mediaType = MediaType.IMAGE_GIF;
                    break;
            }
        } else if (type.equals("videos")) {
            mediaType = MediaType.parseMediaType("video/mp4");
        }
        
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(fileContent);
    }
} 