package com.badmintonjourney.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    @Value("${file.allowed-extensions}")
    private String allowedExtensions;
    
    public String storeFile(MultipartFile file, String fileType) {
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        try {
            // Check if the file's name contains invalid characters
            if (fileName.contains("..")) {
                throw new RuntimeException("文件名包含无效字符: " + fileName);
            }
            
            // Get file extension
            String fileExtension = getFileExtension(fileName);
            
            // Check if file extension is allowed
            if (!isAllowedExtension(fileExtension)) {
                throw new RuntimeException("不支持的文件类型: " + fileExtension);
            }
            
            // Generate unique file name
            String uniqueFileName = UUID.randomUUID().toString() + "." + fileExtension;
            
            // Determine target directory based on file type
            String targetDir = uploadDir + "/" + fileType;
            Path targetLocation = Paths.get(targetDir).resolve(uniqueFileName);
            
            // Create directory if it doesn't exist
            Files.createDirectories(targetLocation.getParent());
            
            // Copy file to the target location
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            return fileType + "/" + uniqueFileName;
        } catch (IOException ex) {
            throw new RuntimeException("无法存储文件 " + fileName + ". 请重试!", ex);
        }
    }
    
    public void deleteFile(String filePath) {
        try {
            Path fileToDelete = Paths.get(uploadDir).resolve(filePath);
            Files.deleteIfExists(fileToDelete);
        } catch (IOException ex) {
            // Log error but don't throw exception
            System.err.println("删除文件失败: " + filePath);
        }
    }
    
    public byte[] loadFileAsBytes(String filePath) {
        try {
            Path file = Paths.get(uploadDir).resolve(filePath);
            return Files.readAllBytes(file);
        } catch (IOException ex) {
            throw new RuntimeException("文件未找到: " + filePath, ex);
        }
    }
    
    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        return (dotIndex == -1) ? "" : fileName.substring(dotIndex + 1).toLowerCase();
    }
    
    private boolean isAllowedExtension(String extension) {
        List<String> allowed = Arrays.asList(allowedExtensions.split(","));
        return allowed.contains(extension.toLowerCase());
    }
} 