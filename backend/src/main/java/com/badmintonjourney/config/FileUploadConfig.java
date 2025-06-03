package com.badmintonjourney.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.File;

@Configuration
public class FileUploadConfig {
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    @PostConstruct
    public void init() {
        // Create upload directories if they don't exist
        File uploadDirectory = new File(uploadDir);
        if (!uploadDirectory.exists()) {
            uploadDirectory.mkdirs();
        }
        
        // Create subdirectories for different file types
        File photosDir = new File(uploadDir + "/photos");
        File videosDir = new File(uploadDir + "/videos");
        
        if (!photosDir.exists()) {
            photosDir.mkdirs();
        }
        
        if (!videosDir.exists()) {
            videosDir.mkdirs();
        }
    }
} 