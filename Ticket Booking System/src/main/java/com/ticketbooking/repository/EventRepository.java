package com.ticketbooking.repository;

import com.ticketbooking.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByShowDateAscShowTimeAsc();
    List<Event> findByCategoryIgnoreCaseOrderByShowDateAsc(String category);
    List<Event> findByTitleContainingIgnoreCaseOrderByShowDateAsc(String title);
}

