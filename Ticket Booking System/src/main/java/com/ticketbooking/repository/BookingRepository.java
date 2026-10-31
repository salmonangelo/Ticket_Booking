package com.ticketbooking.repository;

import com.ticketbooking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByCustomerEmailIgnoreCaseOrderByBookingTimeDesc(String customerEmail);

    List<Booking> findByEventIdAndStatus(Long eventId, String status);

    List<Booking> findByCustomerEmailContainingIgnoreCaseOrBookingCodeContainingIgnoreCaseOrderByBookingTimeDesc(
            String email, String code);

    List<Booking> findAllByOrderByBookingTimeDesc();

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'CONFIRMED'")
    Long countConfirmedBookings();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0.0) FROM Booking b WHERE b.status = 'CONFIRMED'")
    Double calculateTotalRevenue();

    @Query("SELECT COALESCE(SUM(b.numberOfSeats), 0) FROM Booking b WHERE b.status = 'CONFIRMED'")
    Long calculateTotalTicketsSold();
}

