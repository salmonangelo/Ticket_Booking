/**
 * ShowPass - Ticket Booking System Frontend Logic
 * Vanilla JavaScript communicating with Spring Boot REST API
 */

const API_BASE = '/api';

// State
let allEvents = [];
let currentCategory = 'ALL';
let activeEvent = null;
let occupiedSeatsSet = new Set();
let selectedSeatsSet = new Set();
let searchDebounceTimer = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    // Pre-fill tomorrow's date in add event modal
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('eventDate');
    if (dateInput) {
        dateInput.value = tomorrow.toISOString().split('T')[0];
    }
});

/* ===================================================================
   Tab Navigation
   =================================================================== */
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    if (tabId === 'browse') {
        document.getElementById('browseTab').classList.add('active');
        document.getElementById('navBrowse').classList.add('active');
        loadEvents();
    } else if (tabId === 'my-bookings') {
        document.getElementById('myBookingsTab').classList.add('active');
        document.getElementById('navMyBookings').classList.add('active');
        loadAllUserBookings();
    } else if (tabId === 'admin') {
        document.getElementById('adminTab').classList.add('active');
        document.getElementById('navAdmin').classList.add('active');
        loadAdminData();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===================================================================
   Browse Shows & Events
   =================================================================== */
async function loadEvents(category = currentCategory, search = '') {
    const grid = document.getElementById('eventsGrid');
    grid.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Fetching upcoming shows...</p>
        </div>`;

    try {
        let url = `${API_BASE}/events`;
        const params = new URLSearchParams();
        if (category && category !== 'ALL') params.append('category', category);
        if (search && search.trim() !== '') params.append('search', search.trim());
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load events');
        allEvents = await res.json();
        renderEventCards(allEvents);
    } catch (err) {
        console.error('Error loading events:', err);
        grid.innerHTML = `
            <div class="empty-state">
                <p>⚠️ Unable to connect to MySQL backend.</p>
                <p style="font-size:0.85rem; margin-top:0.5rem; color:#94a3b8;">
                    Ensure XAMPP MySQL is started and Spring Boot backend is running.
                </p>
            </div>`;
        showToast('Cannot load events. Check XAMPP MySQL connection.', 'error');
    }
}

function renderEventCards(events) {
    const grid = document.getElementById('eventsGrid');
    if (!events || events.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No shows found</h3>
                <p>Try searching for a different keyword or category.</p>
            </div>`;
        return;
    }

    grid.innerHTML = events.map(event => {
        const posterImg = event.imageUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
        return `
            <div class="event-card">
                <div class="event-poster">
                    <img src="${escapeHtml(posterImg)}" alt="${escapeHtml(event.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'">
                    <span class="category-tag ${escapeHtml(event.category)}">${escapeHtml(event.category)}</span>
                </div>
                <div class="event-body">
                    <h3 class="event-title">${escapeHtml(event.title)}</h3>
                    <div class="event-venue">
                        <span>📍</span>
                        <span>${escapeHtml(event.venue)}</span>
                    </div>
                    <div class="event-venue" style="color: var(--accent-cyan);">
                        <span>🗓️</span>
                        <span>${formatDate(event.showDate)} • ${escapeHtml(event.showTime)}</span>
                    </div>
                    <p class="event-description">${escapeHtml(event.description || 'Join us for an unforgettable live experience.')}</p>
                    
                    <div class="event-footer">
                        <div class="event-price">
                            <span class="price-sub">Starting from</span>
                            <span class="price-val">$${Number(event.ticketPrice).toFixed(2)}</span>
                        </div>
                        <button class="btn btn-primary" onclick="openSeatModal(${event.id})">
                            Book Seats
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterByCategory(category) {
    currentCategory = category;
    document.querySelectorAll('#categoryPills .pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.trim().toUpperCase() === category.toUpperCase() || (category === 'ALL' && btn.textContent.trim() === 'All'));
    });
    const searchVal = document.getElementById('eventSearchInput').value;
    loadEvents(currentCategory, searchVal);
}

function handleSearch() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        const query = document.getElementById('eventSearchInput').value;
        loadEvents(currentCategory, query);
    }, 300);
}

/* ===================================================================
   Seat Map & Selection Modal
   =================================================================== */
async function openSeatModal(eventId) {
    try {
        const [eventRes, occupiedRes] = await Promise.all([
            fetch(`${API_BASE}/events/${eventId}`),
            fetch(`${API_BASE}/events/${eventId}/occupied-seats`)
        ]);

        if (!eventRes.ok || !occupiedRes.ok) throw new Error('Failed to fetch seat details');

        activeEvent = await eventRes.json();
        const occupiedList = await occupiedRes.json();
        occupiedSeatsSet = new Set(occupiedList);
        selectedSeatsSet.clear();

        document.getElementById('modalEventTitle').textContent = activeEvent.title;
        document.getElementById('modalEventSubtitle').textContent = 
            `${activeEvent.venue} • ${formatDate(activeEvent.showDate)} at ${activeEvent.showTime}`;

        renderSeatGrid();
        updateCheckoutSummary();

        document.getElementById('seatModal').classList.add('active');
    } catch (err) {
        console.error('Error opening seat modal:', err);
        showToast('Failed to load seating chart for this event.', 'error');
    }
}

function closeSeatModal() {
    document.getElementById('seatModal').classList.remove('active');
    selectedSeatsSet.clear();
    activeEvent = null;
}

function renderSeatGrid() {
    const grid = document.getElementById('seatGrid');
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seatsPerRow = 10;

    let html = '';
    rows.forEach(row => {
        html += `<div class="seat-row">`;
        html += `<span class="row-label">${row}</span>`;

        for (let i = 1; i <= seatsPerRow; i++) {
            const seatCode = `${row}${i}`;
            const isOccupied = occupiedSeatsSet.has(seatCode);
            const isSelected = selectedSeatsSet.has(seatCode);

            let classes = 'seat';
            if (isOccupied) classes += ' occupied';
            if (isSelected) classes += ' selected';

            html += `
                <div class="${classes}" 
                     data-seat="${seatCode}"
                     onclick="${isOccupied ? '' : `toggleSeat('${seatCode}')`}"
                     title="Seat ${seatCode} - ${getSeatTierName(row)}">
                    ${i}
                </div>
            `;
        }
        html += `</div>`;
    });

    grid.innerHTML = html;
}

function getSeatTierName(row) {
    if (row === 'A' || row === 'B') return 'VIP (+25%)';
    if (row === 'E') return 'Economy (-15%)';
    return 'Standard';
}

function calculateSeatPrice(seatCode, basePrice) {
    const row = seatCode.charAt(0);
    if (row === 'A' || row === 'B') return basePrice * 1.25;
    if (row === 'E') return basePrice * 0.85;
    return basePrice;
}

function toggleSeat(seatCode) {
    if (selectedSeatsSet.has(seatCode)) {
        selectedSeatsSet.delete(seatCode);
    } else {
        selectedSeatsSet.add(seatCode);
    }
    renderSeatGrid();
    updateCheckoutSummary();
}

function updateCheckoutSummary() {
    const seatsArray = Array.from(selectedSeatsSet);
    const count = seatsArray.length;

    document.getElementById('selectedSeatsCount').textContent = count;
    document.getElementById('selectedSeatsLabel').textContent = count > 0 ? seatsArray.join(', ') : 'None';

    let total = 0;
    if (activeEvent) {
        seatsArray.forEach(seat => {
            total += calculateSeatPrice(seat, activeEvent.ticketPrice);
        });
    }

    document.getElementById('totalPriceLabel').textContent = `$${total.toFixed(2)}`;
    document.getElementById('confirmBookingBtn').disabled = count === 0;
}

/* ===================================================================
   Booking Submission
   =================================================================== */
async function submitBooking(event) {
    event.preventDefault();

    if (selectedSeatsSet.size === 0) {
        showToast('Please select at least one seat.', 'error');
        return;
    }

    const bookingPayload = {
        eventId: activeEvent.id,
        customerName: document.getElementById('custName').value.trim(),
        customerEmail: document.getElementById('custEmail').value.trim(),
        customerPhone: document.getElementById('custPhone').value.trim(),
        paymentMethod: document.getElementById('paymentMethod').value,
        selectedSeats: Array.from(selectedSeatsSet)
    };

    const confirmBtn = document.getElementById('confirmBookingBtn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Processing Booking...';

    try {
        const res = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingPayload)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Booking submission failed');
        }

        // Success: close seat modal and show confirmed ticket
        closeSeatModal();
        openTicketModal(data);
        showToast(`🎉 Booking confirmed! Reference: ${data.bookingCode}`, 'success');

        // Reset form
        document.getElementById('bookingForm').reset();
    } catch (err) {
        console.error('Booking error:', err);
        showToast(err.message || 'An error occurred during booking', 'error');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm Booking & Pay';
    }
}

/* ===================================================================
   Digital Ticket Modal
   =================================================================== */
function openTicketModal(booking) {
    document.getElementById('ticketCode').textContent = booking.bookingCode;
    document.getElementById('ticketEventTitle').textContent = booking.event ? booking.event.title : 'Event';
    document.getElementById('ticketVenue').textContent = booking.event ? booking.event.venue : '';
    document.getElementById('ticketDate').textContent = booking.event ? formatDate(booking.event.showDate) : '';
    document.getElementById('ticketTime').textContent = booking.event ? booking.event.showTime : '';
    document.getElementById('ticketSeats').textContent = booking.seatNumbers;
    document.getElementById('ticketAmount').textContent = `$${Number(booking.totalAmount).toFixed(2)}`;
    document.getElementById('ticketCustomer').textContent = booking.customerName;
    document.getElementById('ticketPayment').textContent = `${booking.paymentMethod} (Paid)`;
    document.getElementById('ticketBarcodeText').textContent = `SHOWPASS-${booking.bookingCode}`;

    document.getElementById('ticketModal').classList.add('active');
}

function closeTicketModal() {
    document.getElementById('ticketModal').classList.remove('active');
}

function printTicket() {
    window.print();
}

/* ===================================================================
   My Bookings Tab Logic
   =================================================================== */
async function loadAllUserBookings() {
    const list = document.getElementById('bookingsList');
    list.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading your reservations...</p>
        </div>`;

    try {
        const res = await fetch(`${API_BASE}/bookings`);
        if (!res.ok) throw new Error('Failed to load bookings');
        const bookings = await res.json();
        renderBookingsList(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        list.innerHTML = `
            <div class="empty-state">
                <p>Failed to retrieve bookings from XAMPP MySQL.</p>
            </div>`;
    }
}

async function searchBookings() {
    const query = document.getElementById('bookingSearchQuery').value.trim();
    const list = document.getElementById('bookingsList');
    list.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Searching tickets...</p>
        </div>`;

    try {
        const res = await fetch(`${API_BASE}/bookings?search=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        const bookings = await res.json();
        renderBookingsList(bookings);
    } catch (err) {
        console.error('Search error:', err);
        showToast('Error searching bookings', 'error');
    }
}

function renderBookingsList(bookings) {
    const list = document.getElementById('bookingsList');
    if (!bookings || bookings.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <h3>No bookings found</h3>
                <p>Try searching for a different code or email, or book a new ticket!</p>
            </div>`;
        return;
    }

    list.innerHTML = bookings.map(b => {
        const isCancelled = b.status === 'CANCELLED';
        return `
            <div class="booking-card">
                <div class="booking-main-info">
                    <span class="booking-code-pill">${escapeHtml(b.bookingCode)}</span>
                    <h4>${escapeHtml(b.event ? b.event.title : 'Event')}</h4>
                    <div class="booking-details-row">
                        <span>📍 ${escapeHtml(b.event ? b.event.venue : '')}</span>
                        <span>🗓️ ${b.event ? formatDate(b.event.showDate) : ''} at ${b.event ? b.event.showTime : ''}</span>
                        <span>💺 Seats: <strong style="color:var(--accent-cyan);">${escapeHtml(b.seatNumbers)}</strong></span>
                        <span>👤 Guest: ${escapeHtml(b.customerName)}</span>
                    </div>
                </div>

                <div class="booking-right-side">
                    <div style="text-align: right;">
                        <span class="status-badge ${b.status}">${b.status}</span>
                        <div style="font-size: 1.15rem; font-weight: 800; color: var(--accent-green); margin-top: 0.3rem;">
                            $${Number(b.totalAmount).toFixed(2)}
                        </div>
                    </div>

                    <button class="btn btn-secondary btn-sm" onclick='viewSavedTicket(${JSON.stringify(b).replace(/'/g, "&apos;")})'>
                        View Pass
                    </button>

                    ${!isCancelled ? `
                        <button class="btn btn-danger btn-sm" onclick="cancelUserBooking(${b.id}, '${escapeHtml(b.bookingCode)}')">
                            Cancel
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function viewSavedTicket(booking) {
    openTicketModal(booking);
}

async function cancelUserBooking(id, code) {
    if (!confirm(`Are you sure you want to cancel booking ${code}? Your reserved seats will be released.`)) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, { method: 'PUT' });
        if (!res.ok) throw new Error('Failed to cancel booking');
        showToast(`Booking ${code} cancelled successfully.`, 'info');
        loadAllUserBookings();
    } catch (err) {
        console.error('Cancel booking error:', err);
        showToast('Could not cancel booking.', 'error');
    }
}

/* ===================================================================
   Admin Panel Management & Analytics
   =================================================================== */
async function loadAdminData() {
    try {
        const [statsRes, eventsRes, bookingsRes] = await Promise.all([
            fetch(`${API_BASE}/stats`),
            fetch(`${API_BASE}/events`),
            fetch(`${API_BASE}/bookings`)
        ]);

        if (statsRes.ok) {
            const stats = await statsRes.json();
            document.getElementById('statTotalEvents').textContent = stats.totalEvents;
            document.getElementById('statTotalBookings').textContent = stats.totalBookings;
            document.getElementById('statTicketsSold').textContent = stats.totalTicketsSold;
            document.getElementById('statTotalRevenue').textContent = `$${Number(stats.totalRevenue).toFixed(2)}`;
        }

        if (eventsRes.ok) {
            const events = await eventsRes.json();
            renderAdminEventsTable(events);
        }

        if (bookingsRes.ok) {
            const bookings = await bookingsRes.json();
            renderAdminBookingsTable(bookings);
        }
    } catch (err) {
        console.error('Admin data error:', err);
        showToast('Failed to load admin analytics from MySQL', 'error');
    }
}

function renderAdminEventsTable(events) {
    const tbody = document.getElementById('adminEventsTableBody');
    if (!events || events.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No events available.</td></tr>`;
        return;
    }

    tbody.innerHTML = events.map(e => `
        <tr>
            <td><strong>${escapeHtml(e.title)}</strong></td>
            <td><span class="category-tag ${e.category}" style="position:static; padding:0.2rem 0.5rem;">${escapeHtml(e.category)}</span></td>
            <td>${escapeHtml(e.venue)}</td>
            <td>${formatDate(e.showDate)} • ${escapeHtml(e.showTime)}</td>
            <td><strong>$${Number(e.ticketPrice).toFixed(2)}</strong></td>
            <td>${e.totalSeats} seats</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteEventById(${e.id}, '${escapeHtml(e.title)}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function renderAdminBookingsTable(bookings) {
    const tbody = document.getElementById('adminBookingsTableBody');
    if (!bookings || bookings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No bookings recorded yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = bookings.slice(0, 10).map(b => `
        <tr>
            <td><code>${escapeHtml(b.bookingCode)}</code></td>
            <td>${escapeHtml(b.event ? b.event.title : 'N/A')}</td>
            <td>${escapeHtml(b.customerName)}<br><small style="color:var(--text-muted);">${escapeHtml(b.customerEmail)}</small></td>
            <td><span style="color:var(--accent-cyan); font-weight:700;">${escapeHtml(b.seatNumbers)}</span></td>
            <td><strong>$${Number(b.totalAmount).toFixed(2)}</strong></td>
            <td><span class="status-badge ${b.status}">${b.status}</span></td>
            <td>${b.bookingTime ? b.bookingTime.substring(0, 10) : ''}</td>
        </tr>
    `).join('');
}

function openAddEventModal() {
    document.getElementById('addEventForm').reset();
    document.getElementById('eventModalTitle').textContent = 'Create New Event';
    document.getElementById('editEventId').value = '';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('eventDate').value = tomorrow.toISOString().split('T')[0];
    document.getElementById('addEventModal').classList.add('active');
}

function closeAddEventModal() {
    document.getElementById('addEventModal').classList.remove('active');
}

async function saveEvent(e) {
    e.preventDefault();

    const eventData = {
        title: document.getElementById('eventTitle').value.trim(),
        category: document.getElementById('eventCategory').value,
        venue: document.getElementById('eventVenue').value.trim(),
        showDate: document.getElementById('eventDate').value,
        showTime: document.getElementById('eventTime').value.trim(),
        ticketPrice: parseFloat(document.getElementById('eventPrice').value),
        totalSeats: parseInt(document.getElementById('eventSeats').value, 10),
        imageUrl: document.getElementById('eventImage').value.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
        description: document.getElementById('eventDesc').value.trim()
    };

    try {
        const res = await fetch(`${API_BASE}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });

        if (!res.ok) throw new Error('Failed to create event');

        showToast('Event created successfully!', 'success');
        closeAddEventModal();
        loadAdminData();
    } catch (err) {
        console.error('Error saving event:', err);
        showToast('Failed to save event to MySQL database.', 'error');
    }
}

async function deleteEventById(id, title) {
    if (!confirm(`Are you sure you want to delete event "${title}"? All associated bookings will be removed.`)) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/events/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        showToast('Event deleted.', 'info');
        loadAdminData();
    } catch (err) {
        console.error('Delete error:', err);
        showToast('Failed to delete event.', 'error');
    }
}

/* ===================================================================
   Utility Functions & Toasts
   ================================================================== */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const d = new Date(parts[0], parts[1] - 1, parts[2]);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return dateStr;
    } catch (e) {
        return dateStr;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

