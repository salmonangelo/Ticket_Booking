package com.ticketbooking.service;

import com.ticketbooking.dto.BookingRequest;
import com.ticketbooking.dto.StatsResponse;
import com.ticketbooking.exception.ResourceNotFoundException;
import com.ticketbooking.exception.SeatAlreadyBookedException;
import com.ticketbooking.model.Booking;
import com.ticketbooking.model.Event;
import com.ticketbooking.repository.BookingRepository;
import com.ticketbooking.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.*;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final EventService eventService;
    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    public BookingService(BookingRepository bookingRepository,
                          EventRepository eventRepository,
                          EventService eventService) {
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
        this.eventService = eventService;
    }

    @Transactional
    public Booking createBooking(BookingRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Booking request cannot be empty.");
        }
        if (request.getEventId() == null) {
            throw new IllegalArgumentException("Event ID is required.");
        }
        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer name is required.");
        }
        if (request.getCustomerEmail() == null || !request.getCustomerEmail().contains("@")) {
            throw new IllegalArgumentException("A valid customer email is required.");
        }
        if (request.getCustomerPhone() == null || request.getCustomerPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer phone number is required.");
        }

        List<String> requestedSeats = request.getSelectedSeats();
        if (requestedSeats == null || requestedSeats.isEmpty()) {
            throw new IllegalArgumentException("At least one seat must be selected.");
        }

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + request.getEventId()));

        // Clean seat labels
        List<String> cleanSeats = new ArrayList<>();
        for (String s : requestedSeats) {
            if (s != null && !s.trim().isEmpty()) {
                cleanSeats.add(s.trim().toUpperCase());
            }
        }

        // Check if any seats are already booked
        Set<String> alreadyOccupied = eventService.getOccupiedSeats(event.getId());
        List<String> conflictingSeats = new ArrayList<>();
        for (String seat : cleanSeats) {
            if (alreadyOccupied.contains(seat)) {
                conflictingSeats.add(seat);
            }
        }

        if (!conflictingSeats.isEmpty()) {
            throw new SeatAlreadyBookedException("Seats " + conflictingSeats + " are already booked. Please choose other seats.");
        }

        // Calculate dynamic total price based on seat tiers
        // Row A & B: VIP (+25%)
        // Row C & D: Standard (100%)
        // Row E: Economy (-15%)
        double basePrice = event.getTicketPrice();
        double total = 0.0;

        for (String seat : cleanSeats) {
            char row = seat.charAt(0);
            double seatPrice = basePrice;
            if (row == 'A' || row == 'B') {
                seatPrice = basePrice * 1.25;
            } else if (row == 'E') {
                seatPrice = basePrice * 0.85;
            }
            total += seatPrice;
        }

        // Round to 2 decimal places
        total = Math.round(total * 100.0) / 100.0;

        String bookingCode = generateUniqueBookingCode();

        Booking booking = new Booking();
        booking.setBookingCode(bookingCode);
        booking.setEvent(event);
        booking.setCustomerName(request.getCustomerName().trim());
        booking.setCustomerEmail(request.getCustomerEmail().trim());
        booking.setCustomerPhone(request.getCustomerPhone().trim());
        booking.setSeatNumbers(String.join(", ", cleanSeats));
        booking.setNumberOfSeats(cleanSeats.size());
        booking.setTotalAmount(total);
        booking.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Credit/Debit Card");
        booking.setStatus("CONFIRMED");

        return bookingRepository.save(booking);
    }

    public Booking getBookingByCode(String code) {
        return bookingRepository.findByBookingCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with Code: " + code));
    }

    public List<Booking> searchBookings(String query) {
        if (query == null || query.trim().isEmpty()) {
            return bookingRepository.findAllByOrderByBookingTimeDesc();
        }
        String q = query.trim();
        return bookingRepository.findByCustomerEmailContainingIgnoreCaseOrBookingCodeContainingIgnoreCaseOrderByBookingTimeDesc(q, q);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByBookingTimeDesc();
    }

    @Transactional
    public Booking cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Booking is already cancelled.");
        }

        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }

    public StatsResponse getDashboardStats() {
        long totalEvents = eventRepository.count();
        long totalBookings = bookingRepository.countConfirmedBookings();
        double totalRevenue = bookingRepository.calculateTotalRevenue();
        long totalTicketsSold = bookingRepository.calculateTotalTicketsSold();

        return new StatsResponse(totalEvents, totalBookings, totalRevenue, totalTicketsSold);
    }

    private String generateUniqueBookingCode() {
        String code;
        do {
            int number = 100000 + RANDOM.nextInt(900000);
            char letter1 = (char) ('A' + RANDOM.nextInt(26));
            char letter2 = (char) ('A' + RANDOM.nextInt(26));
            code = "BK-" + number + letter1 + letter2;
        } while (bookingRepository.findByBookingCode(code).isPresent());
        return code;
    }
}
