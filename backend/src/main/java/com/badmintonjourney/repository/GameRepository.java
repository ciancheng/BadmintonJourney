package com.badmintonjourney.repository;

import com.badmintonjourney.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findByMatchIdOrderByGameNumber(Long matchId);
} 