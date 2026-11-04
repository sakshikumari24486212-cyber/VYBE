document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("registrationForm");
    const eventSelect = document.getElementById("event");
    const confirmation = document.getElementById("confirmation");

    // Create a message area for errors and feedback
    const message = document.createElement("p");
    message.id = "formMessage";
    message.style.marginTop = "15px";
    message.style.textAlign = "center";
    form.appendChild(message);

    function showMessage(text, color) {
        message.textContent = text;
        message.style.color = color;
    }

    // Load events from the shared events-data.js file
    function loadEvents() {

        if (!Array.isArray(window.CULTURAL_EVENTS)) {
            showMessage(
                "Events will appear when the shared events data is added.",
                "#FF9B50"
            );
            return;
        }

        window.CULTURAL_EVENTS.forEach(function (event) {

            const option = document.createElement("option");

            option.value = event.id;
            option.textContent = event.name;

            eventSelect.appendChild(option);
        });

        // Select an event if its ID is present in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const selectedEvent = urlParams.get("event");

        if (selectedEvent) {
            eventSelect.value = selectedEvent;
        }
    }

    loadEvents();

    // Handle registration form submission
    form.addEventListener("submit", function (event) {

        event.preventDefault();

        showMessage("", "");

        const studentName =
            document.getElementById("studentName").value.trim();

        const registrationNumber =
            document.getElementById("registrationNumber").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const department =
            document.getElementById("department").value;

        const year =
            document.getElementById("year").value;

        const selectedEvent = eventSelect.value;

        // Check required fields
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Check student name
        if (studentName.length < 2) {
            showMessage(
                "Please enter a valid full name.",
                "#FF7777"
            );
            return;
        }

        // Check phone number
        if (!/^[0-9]{10}$/.test(phone)) {
            showMessage(
                "Please enter a valid 10-digit phone number.",
                "#FF7777"
            );
            return;
        }

        // Check email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage(
                "Please enter a valid email address.",
                "#FF7777"
            );
            return;
        }

        // Check event selection
        if (!selectedEvent) {
            showMessage(
                "Please select an event.",
                "#FF7777"
            );
            return;
        }

        // Wait for the shared storage system
        if (
            !window.FestStorage ||
            typeof window.FestStorage.registerStudent !== "function"
        ) {
            showMessage(
                "Your details are valid. Registration saving will be enabled when the shared storage system is added.",
                "#FF9B50"
            );
            return;
        }

        showMessage(
            "Form validation successful. Shared registration integration is ready for testing.",
            "#ED55A6"
        );

        console.log("Student details validated:", {
            studentName: studentName,
            registrationNumber: registrationNumber,
            email: email,
            phone: phone,
            department: department,
            year: year,
            eventId: selectedEvent
        });

    });

});
