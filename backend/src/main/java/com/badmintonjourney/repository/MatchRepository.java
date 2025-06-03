package com.badmintonjourney.repository;

import com.badmintonjourney.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByCompetitionIdOrderByCreatedAt(Long competitionId);
} 