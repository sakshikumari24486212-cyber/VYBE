document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("registrationForm");
    const eventSelect = document.getElementById("event");
    const confirmation = document.getElementById("confirmation");
    const confirmationDetails = document.getElementById("confirmationDetails");

    if (!form || !eventSelect || !confirmation || !confirmationDetails) {
        console.error("Registration page elements are missing.");
        return;
    }

    const message = document.createElement("p");
    message.id = "formMessage";
    message.setAttribute("role", "status");
    message.style.marginTop = "15px";
    message.style.textAlign = "center";
    form.appendChild(message);

    function showMessage(text, color) {
        message.textContent = text;
        message.style.color = color;
    }

    // Load events from shared event data
    function loadEvents() {

        if (!Array.isArray(window.CULTURAL_EVENTS)) {
            showMessage(
                "Shared event data is not available yet.",
                "#C47A28"
            );
            return;
        }

        eventSelect.querySelectorAll("option:not(:first-child)")
            .forEach(option => option.remove());

        window.CULTURAL_EVENTS.forEach(function (event) {

            const option = document.createElement("option");
            option.value = event.id;
            option.textContent = event.name;

            eventSelect.appendChild(option);
        });

        const params = new URLSearchParams(window.location.search);
        const selectedEvent = params.get("event");

        if (selectedEvent) {
            eventSelect.value = selectedEvent;
        }
    }

    // Display confirmation only after storage confirms success
    function showConfirmation(studentData, eventData, registration) {

        const registrationDate = registration.createdAt
            ? new Date(registration.createdAt)
            : new Date();

        const formattedRegistrationDate = registrationDate.toLocaleDateString(
            "en-IN",
            { day: "2-digit", month: "long", year: "numeric" }
        );

        const eventDate = new Date(eventData.date + "T00:00:00");
        const formattedEventDate = eventDate.toLocaleDateString(
            "en-IN",
            { day: "2-digit", month: "long", year: "numeric" }
        );

        confirmationDetails.textContent =
            "Student Name: " + studentData.studentName +
            "\nRegistration Number: " + studentData.registrationNumber +
            "\nEmail: " + studentData.email +
            "\nDepartment: " + studentData.department +
            "\nAcademic Year: " + studentData.year +
            "\n\nEVENT DETAILS" +
            "\nEvent: " + eventData.name +
            "\nDate: " + formattedEventDate +
            "\nTime: " + eventData.time +
            "\nVenue: " + eventData.venue +
            "\n\nRegistration ID: " + registration.id +
            "\nRegistration Date: " + formattedRegistrationDate;

        form.hidden = true;
        confirmation.hidden = false;

        confirmation.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    loadEvents();

    // Handle form submission
    form.addEventListener("submit", function (event) {

        event.preventDefault();
        showMessage("", "");

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const studentData = {
            studentName: document.getElementById("studentName").value.trim(),
            registrationNumber: document.getElementById("registrationNumber").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            department: document.getElementById("department").value,
            year: document.getElementById("year").value
        };

        const selectedEvent = eventSelect.value;

        if (studentData.studentName.length < 2) {
            showMessage("Please enter a valid full name.", "#D94848");
            return;
        }

        if (!studentData.registrationNumber) {
            showMessage("Please enter your college registration number.", "#D94848");
            return;
        }

        if (!/^[0-9]{10}$/.test(studentData.phone)) {
            showMessage("Please enter a valid 10-digit phone number.", "#D94848");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentData.email)) {
            showMessage("Please enter a valid email address.", "#D94848");
            return;
        }

        if (!selectedEvent) {
            showMessage("Please select an event.", "#D94848");
            return;
        }

        // Wait for shared storage
        if (
            !window.FestStorage ||
            typeof window.FestStorage.registerStudent !== "function"
        ) {
            showMessage(
                "Details validated, but registration cannot be saved until shared storage is connected.",
                "#C47A28"
            );
            return;
        }

        // Find selected event name
        const selectedEventData = Array.isArray(window.CULTURAL_EVENTS)
            ? window.CULTURAL_EVENTS.find(item => item.id === selectedEvent)
            : null;

        if (!selectedEventData) {
            showMessage("Selected event information is unavailable.", "#D94848");
            return;
        }

        try {

            // Send student details to Member 3's shared storage
            const result = window.FestStorage.registerStudent(
                studentData,
                selectedEvent
            );

            // Expected shared storage response:
            // { success: true, registration: { id: "VYBE-001" } }

            if (!result || result.success !== true || !result.registration || !result.registration.id) {
                showMessage(
                    result && result.message
                        ? result.message
                        : "Registration could not be confirmed. Please try again.",
                    "#D94848"
                );
                return;
            }

            showConfirmation(
                studentData,
                selectedEventData,
                result.registration
            );

        } catch (error) {

            console.error("Registration error:", error);

            showMessage(
                "Something went wrong while saving your registration.",
                "#D94848"
            );
        }

    });

});

