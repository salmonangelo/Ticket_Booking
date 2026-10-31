package com.ticketbooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TicketBookingApplication {

    public static void main(String[] args) {
        SpringApplication.run(TicketBookingApplication.class, args);
        System.out.println("=================================================");
        System.out.println(" Ticket Booking System Backend is running!");
        System.out.println(" Open frontend: http://localhost:8080");
        System.out.println(" REST API Base: http://localhost:8080/api");
        System.out.println("=================================================");
    }
}

