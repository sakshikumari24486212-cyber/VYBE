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
        const searchForm = document.getElementById("dashboardSearchForm");

        function filterRegistrations() {
            const search = searchInput.value.trim().toLowerCase();

            const filtered = registrations.filter(item =>
                String(item.studentName || "").toLowerCase().includes(search) ||
                String(item.registrationNumber || "").toLowerCase().includes(search) ||
                String(item.email || "").toLowerCase().includes(search)
            );

            displayRegistrations(filtered);
        }

        searchInput.addEventListener("input", filterRegistrations);

        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            filterRegistrations();
        });
    }

    function displayRegistrations(registrations) {
        const table = document.getElementById("registrationTable");
        table.replaceChildren();

        if (registrations.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 10;
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
                item.phone,
                item.department,
                item.year,
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

    function setupStatCards() {
        document.querySelectorAll(".stat-card").forEach(card => {
            function openDetails() {
                window.location.href =
                    "details.html?view=" + card.dataset.view;
            }

            card.addEventListener("click", openDetails);

            card.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openDetails();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (window.FestStorage) {
            loadDashboard();
            setupStatCards();
        } else {
            console.error("FestStorage is not loaded.");
        }
    });
})();
