package com.ticketbooking.config;

import com.ticketbooking.model.Event;
import com.ticketbooking.repository.EventRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EventRepository eventRepository;

    public DataInitializer(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Override
    public void run(String... args) {
        if (eventRepository.count() == 0) {
            List<Event> initialEvents = Arrays.asList(
                new Event(
                    "Interstellar: IMAX Special",
                    "Movie",
                    "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival. Experience Nolan's masterpiece in full IMAX format.",
                    "PVR Superplex IMAX - Screen 1",
                    LocalDate.now().plusDays(1),
                    "19:00",
                    15.00,
                    50,
                    "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
                ),
                new Event(
                    "Coldplay: Music of the Spheres Tour",
                    "Concert",
                    "Live in concert performing hits like 'Yellow', 'Viva La Vida', 'Fix You', and latest album specials with kinetic stages and LED wristbands.",
                    "National Arena Stadium",
                    LocalDate.now().plusDays(4),
                    "20:30",
                    75.00,
                    50,
                    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80"
                ),
                new Event(
                    "Dune: Part Two",
                    "Movie",
                    "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
                    "Cinepolis VIP Cinema - Audi 3",
                    LocalDate.now().plusDays(2),
                    "17:45",
                    14.50,
                    50,
                    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
                ),
                new Event(
                    "Trevor Noah: 'Off The Record' Tour",
                    "Comedy",
                    "Global comedy sensation Trevor Noah brings his acclaimed stand-up world tour full of sharp wit, international commentary, and laughter.",
                    "Grand Opera Concert Hall",
                    LocalDate.now().plusDays(6),
                    "19:30",
                    45.00,
                    50,
                    "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80"
                ),
                new Event(
                    "The Lion King: Broadway Musical",
                    "Theater",
                    "More than 100 million people around the world have experienced the awe-inspiring visual artistry, music, and theatrical magic.",
                    "Metropolitan Arts Pavilion",
                    LocalDate.now().plusDays(8),
                    "18:00",
                    60.00,
                    50,
                    "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80"
                ),
                new Event(
                    "Formula 1 Night Championship",
                    "Sports",
                    "Feel the thunder and speed under the neon floodlights as the world's top drivers battle for the podium.",
                    "Marina Bay Grand Circuit",
                    LocalDate.now().plusDays(12),
                    "21:00",
                    120.00,
                    50,
                    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80"
                )
            );
            eventRepository.saveAll(initialEvents);
            System.out.println(">>> Ticket Booking System: Initial sample events seeded successfully!");
        }
    }
}

