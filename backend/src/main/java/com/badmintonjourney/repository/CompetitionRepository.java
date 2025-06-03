package com.badmintonjourney.repository;

import com.badmintonjourney.entity.Competition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompetitionRepository extends JpaRepository<Competition, Long> {
    Page<Competition> findByUserIdOrderByStartDateDesc(Long userId, Pageable pageable);
    boolean existsByIdAndUserId(Long id, Long userId);
} 