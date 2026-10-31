# 🎟️ ShowPass - Ticket Booking System

A full-stack, enterprise-grade Ticket Booking System built with **Java (Spring Boot)**, **MySQL (XAMPP / phpMyAdmin)**, and modern **HTML5, CSS3, and JavaScript**.

---

## 🌟 Features

- **Frontend (HTML5 / Modern CSS3 / Vanilla JavaScript)**:
  - **Dynamic Shows Showcase**: Browse movies, concerts, theater, stand-up comedy, and sports events with posters, venue details, and pricing.
  - **Interactive Seat Selection Grid**:
    - Cinema screen curvature visualization.
    - Tiered seating: **VIP (Rows A-B)**, **Standard (Rows C-D)**, and **Economy (Row E)**.
    - Real-time seat occupancy detection (prevents double bookings).
  - **Digital E-Ticket Pass**: Realistic boarding-pass style ticket receipt with barcode simulation and 1-click **Print / Save as PDF**.
  - **My Bookings Portal**: Search by Booking Code (e.g., `BK-84920AB`) or Email, with instant ticket cancellation and seat release.
  - **Admin Management & Analytics Dashboard**: Real-time revenue statistics, ticket counts, event creation, and booking audit log.

- **Backend (Java / Spring Boot)**:
  - Spring Boot RESTful API endpoints for Events, Seat Occupancy, Bookings, and Dashboard Statistics.
  - Conflict-proof transactional booking logic.
  - Auto database table creation and automated demo data seeding (`DataInitializer.java`).

- **Database (XAMPP / phpMyAdmin / MySQL)**:
  - Configured to connect directly to XAMPP MySQL on port `3306`.
  - Auto-creates `ticket_booking_db` if it doesn't already exist.
  - Complete standalone `schema.sql` included for manual import via phpMyAdmin if desired.

---

## 🚀 Quick Start Guide

### Step 1: Start XAMPP (Apache & MySQL)
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **MySQL** (and optionally **Apache**).
3. Ensure MySQL is running on default port `3306`.

> Default XAMPP settings used:
> - **Host**: `localhost:3306`
> - **User**: `root`
> - **Password**: *(empty/blank)*
> - **Database**: `ticket_booking_db` *(automatically created upon startup)*

*(Optional)* You can open [http://localhost/phpmyadmin](http://localhost/phpmyadmin) in your browser to view tables.

---

### Step 2: Open and Run in IntelliJ IDEA

1. Launch **IntelliJ IDEA**.
2. Click **File -> Open...** (or **Open Project** on the welcome screen).
3. Navigate to and select this folder:
   ```
   c:\Users\Sakthi\OneDrive\Documents\Ticket Booking System
   ```
4. Click **OK / Open as Project**.
5. IntelliJ IDEA will automatically detect `pom.xml` and sync Maven dependencies.
6. In the top-right toolbar, select the pre-configured run configuration:
   - **Configuration**: `TicketBookingApplication`
   - Click the green **Play (Run)** button ▶️.
   *(Or open `src/main/java/com/ticketbooking/TicketBookingApplication.java` and click the green arrow next to `public static void main`)*.

---

### Step 3: Open the Web Application
Once the application starts, open your web browser and navigate to:
```
http://localhost:8080
```

---

## 📁 Project Architecture

```
Ticket Booking System/
├── .mvn/
│   └── wrapper/
│       └── maven-wrapper.properties
├── .run/
│   └── TicketBookingApplication.run.xml   <-- Pre-configured IntelliJ IDEA Run button
├── pom.xml                                <-- Maven configuration (Spring Boot 3.2.5, Java 17)
├── schema.sql                             <-- SQL database script for phpMyAdmin
├── mvnw / mvnw.cmd                        <-- Maven wrapper scripts
├── README.md                              <-- Project documentation
└── src/
    └── main/
        ├── java/com/ticketbooking/
        │   ├── TicketBookingApplication.java      <-- Spring Boot Main Application
        │   ├── config/
        │   │   ├── CorsConfig.java                <-- Cross-Origin configuration
        │   │   └── DataInitializer.java           <-- Auto seeds 6 sample shows on first launch
        │   ├── controller/
        │   │   ├── EventController.java           <-- /api/events
        │   │   ├── BookingController.java         <-- /api/bookings
        │   │   └── StatsController.java           <-- /api/stats
        │   ├── dto/
        │   │   ├── BookingRequest.java
        │   │   └── StatsResponse.java
        │   ├── exception/
        │   │   ├── GlobalExceptionHandler.java
        │   │   ├── ResourceNotFoundException.java
        │   │   └── SeatAlreadyBookedException.java
        │   ├── model/
        │   │   ├── Event.java                     <-- JPA Entity for events
        │   │   └── Booking.java                   <-- JPA Entity for bookings
        │   ├── repository/
        │   │   ├── EventRepository.java
        │   │   └── BookingRepository.java
        │   └── service/
        │       ├── EventService.java
        │       └── BookingService.java
        └── resources/
            ├── application.properties             <-- XAMPP MySQL database connection
            └── static/
                ├── index.html                     <-- Frontend single-page app
                ├── css/
                │   └── style.css                  <-- Luxury dark mode & seat map styles
                └── js/
                    └── app.js                     <-- Interactive UI, seat selector & REST calls
```

---

## 🛠️ API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | Retrieve all shows (supports `?category=Movie&search=Dune`) |
| `GET` | `/api/events/{id}` | Get event details by ID |
| `GET` | `/api/events/{id}/occupied-seats` | Get list of currently booked seat codes |
| `POST` | `/api/events` | Create a new event (Admin) |
| `DELETE` | `/api/events/{id}` | Delete an event |
| `POST` | `/api/bookings` | Book tickets with seat validation & total calculation |
| `GET` | `/api/bookings` | Retrieve all bookings / search bookings (`?search=...`) |
| `GET` | `/api/bookings/{code}` | Retrieve booking by Booking Code |
| `PUT` | `/api/bookings/{id}/cancel` | Cancel booking and release seats |
| `GET` | `/api/stats` | Retrieve revenue and tickets sold metrics |

