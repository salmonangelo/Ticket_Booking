package com.ticketbooking.service;

import com.ticketbooking.exception.ResourceNotFoundException;
import com.ticketbooking.model.Booking;
import com.ticketbooking.model.Event;
import com.ticketbooking.repository.BookingRepository;
import com.ticketbooking.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    @Autowired
    public EventService(EventRepository eventRepository, BookingRepository bookingRepository) {
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAllByOrderByShowDateAscShowTimeAsc();
    }

    public List<Event> getEventsByCategory(String category) {
        if (category == null || category.trim().isEmpty() || category.equalsIgnoreCase("ALL")) {
            return getAllEvents();
        }
        return eventRepository.findByCategoryIgnoreCaseOrderByShowDateAsc(category.trim());
    }

    public List<Event> searchEvents(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllEvents();
        }
        return eventRepository.findByTitleContainingIgnoreCaseOrderByShowDateAsc(query.trim());
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + id));
    }

    public Event createEvent(Event event) {
        validateEvent(event);
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, Event updatedData) {
        validateEvent(updatedData);
        Event existing = getEventById(id);
        existing.setTitle(updatedData.getTitle());
        existing.setCategory(updatedData.getCategory());
        existing.setDescription(updatedData.getDescription());
        existing.setVenue(updatedData.getVenue());
        existing.setShowDate(updatedData.getShowDate());
        existing.setShowTime(updatedData.getShowTime());
        existing.setTicketPrice(updatedData.getTicketPrice());
        existing.setTotalSeats(updatedData.getTotalSeats() != null ? updatedData.getTotalSeats() : 50);
        if (updatedData.getImageUrl() != null && !updatedData.getImageUrl().trim().isEmpty()) {
            existing.setImageUrl(updatedData.getImageUrl());
        }
        return eventRepository.save(existing);
    }

    public void deleteEvent(Long id) {
        Event event = getEventById(id);
        eventRepository.delete(event);
    }

    public Set<String> getOccupiedSeats(Long eventId) {
        // Validate event exists
        getEventById(eventId);

        List<Booking> confirmedBookings = bookingRepository.findByEventIdAndStatus(eventId, "CONFIRMED");
        Set<String> occupiedSeats = new HashSet<>();

        for (Booking booking : confirmedBookings) {
            if (booking.getSeatNumbers() != null) {
                String[] seats = booking.getSeatNumbers().split(",");
                for (String seat : seats) {
                    occupiedSeats.add(seat.trim());
                }
            }
        }
        return occupiedSeats;
    }

    private void validateEvent(Event event) {
        if (event == null) {
            throw new IllegalArgumentException("Event cannot be null.");
        }
        if (event.getTitle() == null || event.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Event title is required.");
        }
        if (event.getCategory() == null || event.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Event category is required.");
        }
        if (event.getVenue() == null || event.getVenue().trim().isEmpty()) {
            throw new IllegalArgumentException("Event venue is required.");
        }
        if (event.getShowDate() == null) {
            throw new IllegalArgumentException("Show date is required.");
        }
        if (event.getShowTime() == null || event.getShowTime().trim().isEmpty()) {
            throw new IllegalArgumentException("Show time is required.");
        }
        if (event.getTicketPrice() == null || event.getTicketPrice() <= 0) {
            throw new IllegalArgumentException("Ticket price must be greater than zero.");
        }
    }
}
