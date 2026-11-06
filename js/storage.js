(function () {
    "use strict";

    const STORAGE_KEY = "culturama_registrations_v1";

    function getEvents() {
        return window.CULTURAL_EVENTS || [];
    }

    function getAllRegistrations() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Unable to read registrations:", error);
            return [];
        }
    }

    function registerStudent(studentData, eventId) {
        if (!studentData || typeof studentData !== "object") {
            return { success: false, message: "Invalid student information." };
        }

        const event = getEvents().find(
            item => String(item.id) === String(eventId)
        );

        if (!event) {
            return { success: false, message: "Event not found." };
        }

        const requiredFields = [
            "studentName",
            "registrationNumber",
            "email",
            "phone",
            "department",
            "year"
        ];

        for (const field of requiredFields) {
            if (!studentData[field] || !String(studentData[field]).trim()) {
                return {
                    success: false,
                    message: "Missing required field: " + field
                };
            }
        }

        const registrations = getAllRegistrations();

        const duplicate = registrations.some(registration =>
            String(registration.registrationNumber).trim().toLowerCase() ===
                String(studentData.registrationNumber).trim().toLowerCase() &&
            String(registration.eventId) === String(eventId)
        );

        if (duplicate) {
            return {
                success: false,
                message: "Student is already registered for this event."
            };
        }

        const capacity = Number(event.capacity);

        if (!Number.isFinite(capacity) || capacity < 0) {
            return {
                success: false,
                message: "Event capacity is not configured correctly."
            };
        }

        const registeredCount = registrations.filter(
            registration => String(registration.eventId) === String(eventId)
        ).length;

        if (registeredCount >= capacity) {
            return { success: false, message: "This event is full." };
        }

        const registration = {
            ...studentData,
            id: "REG-" + Date.now() + "-" +
                Math.random().toString(36).slice(2, 8),
            eventId: event.id,
            eventName: event.name,
            createdAt: new Date().toISOString(),
            status: "Confirmed"
        };

        try {
            registrations.push(registration);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));

            return {
                success: true,
                message: "Registration successful!",
                registration
            };
        } catch (error) {
            return {
                success: false,
                message: "Unable to save registration."
            };
        }
    }

    function getRegistrationsByEmail(email) {
        const searchEmail = String(email || "").trim().toLowerCase();

        if (!searchEmail) return [];

        return getAllRegistrations().filter(registration =>
            String(registration.email || "").trim().toLowerCase() === searchEmail
        );
    }

    function getRegisteredCount(eventId) {
        return getAllRegistrations().filter(
            registration => String(registration.eventId) === String(eventId)
        ).length;
    }

    function getAvailableSeats(eventId) {
        const event = getEvents().find(
            item => String(item.id) === String(eventId)
        );

        if (!event) return 0;

        const capacity = Number(event.capacity);

        if (!Number.isFinite(capacity)) return 0;

        return Math.max(0, capacity - getRegisteredCount(eventId));
    }

    window.FestStorage = {
        registerStudent,
        getAllRegistrations,
        getRegistrationsByEmail,
        getRegisteredCount,
        getAvailableSeats
    };
})();
