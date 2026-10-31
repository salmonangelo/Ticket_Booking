package com.ticketbooking.dto;

public class StatsResponse {
    private long totalEvents;
    private long totalBookings;
    private double totalRevenue;
    private long totalTicketsSold;

    public StatsResponse() {
    }

    public StatsResponse(long totalEvents, long totalBookings, double totalRevenue, long totalTicketsSold) {
        this.totalEvents = totalEvents;
        this.totalBookings = totalBookings;
        this.totalRevenue = totalRevenue;
        this.totalTicketsSold = totalTicketsSold;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getTotalTicketsSold() {
        return totalTicketsSold;
    }

    public void setTotalTicketsSold(long totalTicketsSold) {
        this.totalTicketsSold = totalTicketsSold;
    }
}

