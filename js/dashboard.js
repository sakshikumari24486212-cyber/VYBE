(function () {
    "use strict";

    function loadDashboard() {
        const registrations = window.FestStorage.getAllRegistrations();
        const events = window.CULTURAL_EVENTS || [];

        const participants = new Set(
            registrations.map(item =>
                String(item.registrationNumber || "").trim().toLowerCase()
            ).filter(Boolean)
        );

        document.getElementById("totalRegistrations").textContent =
            registrations.length;

        document.getElementById("totalEvents").textContent =
            events.length;

        document.getElementById("totalParticipants").textContent =
            participants.size;

        displayRegistrations(registrations);

        const searchInput = document.getElementById("searchInput");

        searchInput.addEventListener("input", function () {
            const search = this.value.trim().toLowerCase();

            const filtered = registrations.filter(item =>
                String(item.studentName || "").toLowerCase().includes(search) ||
                String(item.registrationNumber || "").toLowerCase().includes(search) ||
                String(item.email || "").toLowerCase().includes(search)
            );

            displayRegistrations(filtered);
        });
    }

    function displayRegistrations(registrations) {
        const table = document.getElementById("registrationTable");
        table.replaceChildren();

        if (registrations.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 7;
            cell.textContent = "No registrations found.";

            row.appendChild(cell);
            table.appendChild(row);
            return;
        }

        registrations.forEach(item => {
            const row = document.createElement("tr");

            const values = [
                item.id,
                item.studentName,
                item.registrationNumber,
                item.email,
                item.eventName,
                item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "",
                item.status
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value || "-";
                row.appendChild(cell);
            });

            table.appendChild(row);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (window.FestStorage) {
            loadDashboard();
        } else {
            console.error("FestStorage is not loaded.");
        }
    });
})();

