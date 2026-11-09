(function () {
    "use strict";

    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");

    const title = document.getElementById("pageTitle");
    const description = document.getElementById("pageDescription");
    const summaryLabel = document.getElementById("summaryLabel");
    const summaryCount = document.getElementById("summaryCount");
    const tableHead = document.getElementById("detailsHead");
    const tableBody = document.getElementById("detailsBody");
    const searchForm = document.getElementById("detailsSearchForm");
    const searchInput = document.getElementById("detailsSearch");

    function setHeading(heading, subtitle, label, count) {
        title.textContent = heading;
        description.textContent = subtitle;
        summaryLabel.textContent = label;
        summaryCount.textContent = count;
    }

    function displayTable(headers, rows, emptyMessage) {
        const headRow = document.createElement("tr");

        headers.forEach(header => {
            const cell = document.createElement("th");
            cell.textContent = header;
            headRow.appendChild(cell);
        });

        tableHead.replaceChildren(headRow);
        tableBody.replaceChildren();

        if (rows.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = headers.length;
            cell.className = "empty-message";
            cell.textContent = emptyMessage;
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        rows.forEach(values => {
            const row = document.createElement("tr");

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value === null || value === undefined || value === ""
                    ? "-" : String(value);
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });
    }

    function formatDate(value) {
        if (!value) return "-";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
    }

    function showRegistrations() {
        const registrations = window.FestStorage.getAllRegistrations();

        setHeading(
            "Registration Details",
            "Complete list of students registered for VYBE 2026.",
            "Total Registrations",
            registrations.length
        );

        const headers = [
            "Registration ID", "Student Name", "Registration No.",
            "Email", "Phone", "Department", "Year",
            "Event", "Date", "Status"
        ];

        function renderRows(records) {
            const rows = records.map(item => [
                item.id, item.studentName, item.registrationNumber,
                item.email, item.phone, item.department, item.year,
                item.eventName, formatDate(item.createdAt), item.status
            ]);

            displayTable(headers, rows, "No matching registrations found.");
        }

        renderRows(registrations);

        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const query = searchInput.value.trim().toLowerCase();

            const filtered = registrations.filter(item => {
                return [
                    item.studentName,
                    item.registrationNumber,
                    item.email
                ].some(value => String(value || "").toLowerCase().includes(query));
            });

            renderRows(filtered);
        });
    }

    function showEvents() {
        const events = window.CULTURAL_EVENTS || [];

        setHeading(
            "Event Details",
            "Explore all cultural competitions and their seat availability.",
            "Total Events",
            events.length
        );

        const headers = [
            "Event ID", "Event Name", "Total Capacity",
            "Registered", "Available Seats"
        ];

        const rows = events.map(event => [
            event.id, event.name, event.capacity,
            window.FestStorage.getRegisteredCount(event.id),
            window.FestStorage.getAvailableSeats(event.id)
        ]);

        displayTable(headers, rows, "No events are available.");
        searchForm.hidden = true;
    }

    function showParticipants() {
        const registrations = window.FestStorage.getAllRegistrations();
        const uniqueParticipants = new Map();

        registrations.forEach(item => {
            const number = String(item.registrationNumber || "").trim().toLowerCase();
            if (number && !uniqueParticipants.has(number)) {
                uniqueParticipants.set(number, item);
            }
        });

        const participants = Array.from(uniqueParticipants.values());

        setHeading(
            "Participant Details",
            "List of unique students registered for the cultural fest.",
            "Total Participants",
            participants.length
        );

        const headers = [
            "Student Name", "Registration No.", "Email",
            "Phone", "Department", "Year"
        ];

        function renderRows(records) {
            const rows = records.map(item => [
                item.studentName, item.registrationNumber, item.email,
                item.phone, item.department, item.year
            ]);

            displayTable(headers, rows, "No matching participants found.");
        }

        renderRows(participants);

        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const query = searchInput.value.trim().toLowerCase();

            const filtered = participants.filter(item => {
                return [
                    item.studentName,
                    item.registrationNumber,
                    item.email
                ].some(value => String(value || "").toLowerCase().includes(query));
            });

            renderRows(filtered);
        });
    }

    if (!window.FestStorage) {
        setHeading("Storage Unavailable", "Registration storage could not be loaded.", "Total Records", 0);
        displayTable(["Message"], [["Please return to the dashboard and try again."]], "");
        searchForm.hidden = true;
        return;
    }

    switch (view) {
        case "registrations":
            showRegistrations();
            break;
        case "events":
            showEvents();
            break;
        case "participants":
            showParticipants();
            break;
        default:
            setHeading("Details Not Found", "Please select a dashboard section.", "Total Records", 0);
            displayTable(["Message"], [["Invalid details page."]], "");
            searchForm.hidden = true;
    }
})();
