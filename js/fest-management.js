document.addEventListener("DOMContentLoaded", function () {
    const storage = window.VybeFestEvents;

    if (!storage) {
        console.error("VYBE Fest Events storage is not loaded.");
        return;
    }

    const form = document.getElementById("festEventForm");
    const eventList = document.getElementById("festManagedEvents");
    const posterInput = document.getElementById("festPoster");
    const posterPreview = document.getElementById("festPosterPreview");
    const posterPlaceholder = document.getElementById("festPosterPlaceholder");
    const message = document.getElementById("festFormMessage");
    const publishButton = document.getElementById("publishFestEvent");

    let currentPoster = "";

    const fields = {
        id: document.getElementById("festEventId"),
        title: document.getElementById("festTitle"),
        category: document.getElementById("festCategory"),
        date: document.getElementById("festDate"),
        startTime: document.getElementById("festStartTime"),
        endTime: document.getElementById("festEndTime"),
        venue: document.getElementById("festVenue"),
        organizer: document.getElementById("festOrganizer"),
        contact: document.getElementById("festContact"),
        bookingUrl: document.getElementById("festBookingUrl"),
        announcement: document.getElementById("festAnnouncement"),
        description: document.getElementById("festDescription")
    };

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.style.color = isError ? "#b42318" : "#56358c";
    }

    function showPoster(data) {
        currentPoster = data || "";

        if (currentPoster) {
            posterPreview.src = currentPoster;
            posterPreview.hidden = false;
            posterPlaceholder.hidden = true;
        } else {
            posterPreview.removeAttribute("src");
            posterPreview.hidden = true;
            posterPlaceholder.hidden = false;
        }
    }

    function resetForm() {
        form.reset();
        fields.id.value = "";
        currentPoster = "";
        showPoster("");
        publishButton.textContent = "Publish Event";
        showMessage("");
    }

    function getEventStatus(event) {
        if (event.status === "Draft") return "Draft";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const eventDate = new Date(event.date + "T00:00:00");

        return eventDate < today ? "Completed" : "Upcoming";
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;

        return element;
    }

    function formatDate(date) {
        if (!date) return "Date not set";

        return new Date(date + "T00:00:00").toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
    }

    async function loadEvents() {
        eventList.textContent = "";

        try {
            const events = await storage.getAll();

            if (!events.length) {
                eventList.appendChild(
                    createElement("p", "", "No major events added yet. Create your first event above!")
                );
                return;
            }

            events.forEach(function (event) {
                const card = createElement("article", "fest-managed-card");
                const details = createElement("div", "fest-managed-details");
                const title = createElement("h4", "", event.title);
                const category = createElement("p", "", event.category);
                const date = createElement("p", "", formatDate(event.date));
                const venue = createElement("p", "", "Venue: " + event.venue);
                const status = createElement(
                    "span",
                    "fest-status-badge",
                    getEventStatus(event)
                );

                details.append(title, category, date, venue, status);

                if (event.poster) {
                    const image = createElement("img", "fest-managed-poster");
                    image.src = event.poster;
                    image.alt = event.title + " poster";
                    card.appendChild(image);
                }

                const actions = createElement("div", "fest-managed-actions");

                const editButton = createElement("button", "fest-btn fest-btn-secondary", "Edit");
                editButton.type = "button";
                editButton.addEventListener("click", function () {
                    editEvent(event);
                });

                const toggleButton = createElement(
                    "button",
                    "fest-btn fest-btn-secondary",
                    event.status === "Published" ? "Unpublish" : "Publish"
                );
                toggleButton.type = "button";
                toggleButton.addEventListener("click", function () {
                    togglePublish(event);
                });

                const deleteButton = createElement(
                    "button",
                    "fest-btn fest-btn-danger",
                    "Delete"
                );
                deleteButton.type = "button";
                deleteButton.addEventListener("click", function () {
                    deleteEvent(event);
                });

                actions.append(editButton, toggleButton, deleteButton);
                card.append(details, actions);
                eventList.appendChild(card);
            });
        } catch (error) {
            console.error("Could not load fest events:", error);
            eventList.textContent = "Unable to load events. Please refresh the page.";
        }
    }

    async function saveEvent(status) {
        if (!form.reportValidity()) return;

        if (fields.endTime.value <= fields.startTime.value) {
            showMessage("End time must be later than start time.", true);
            fields.endTime.focus();
            return;
        }

        const event = {
            id: fields.id.value || storage.createId(),
            title: fields.title.value.trim(),
            category: fields.category.value,
            date: fields.date.value,
            startTime: fields.startTime.value,
            endTime: fields.endTime.value,
            venue: fields.venue.value.trim(),
            organizer: fields.organizer.value.trim(),
            contact: fields.contact.value.trim(),
            bookingUrl: fields.bookingUrl.value.trim(),
            announcement: fields.announcement.value.trim(),
            description: fields.description.value.trim(),
            poster: currentPoster,
            status: status
        };

        try {
            await storage.save(event);
            resetForm();
            showMessage(status === "Draft" ? "Draft saved successfully!" : "Event published successfully!");
            await loadEvents();
        } catch (error) {
            console.error("Could not save event:", error);
            showMessage("Could not save the event. Please try again.", true);
        }
    }

    function editEvent(event) {
        fields.id.value = event.id;
        fields.title.value = event.title || "";
        fields.category.value = event.category || "";
        fields.date.value = event.date || "";
        fields.startTime.value = event.startTime || "";
        fields.endTime.value = event.endTime || "";
        fields.venue.value = event.venue || "";
        fields.organizer.value = event.organizer || "";
        fields.contact.value = event.contact || "";
        fields.bookingUrl.value = event.bookingUrl || "";
        fields.announcement.value = event.announcement || "";
        fields.description.value = event.description || "";

        showPoster(event.poster || "");
        publishButton.textContent = event.status === "Published" ? "Update Event" : "Publish Event";
        showMessage("Editing: " + event.title);

        form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    async function togglePublish(event) {
        try {
            const updatedEvent = {
                ...event,
                status: event.status === "Published" ? "Draft" : "Published"
            };

            await storage.save(updatedEvent);
            showMessage(updatedEvent.status === "Published" ? "Event published!" : "Event unpublished and saved as draft.");
            await loadEvents();
        } catch (error) {
            console.error("Could not update event:", error);
            showMessage("Unable to update event.", true);
        }
    }

    async function deleteEvent(event) {
        if (!window.confirm("Delete '" + event.title + "' permanently?")) return;

        try {
            await storage.remove(event.id);
            showMessage("Event deleted successfully.");
            await loadEvents();
        } catch (error) {
            console.error("Could not delete event:", error);
            showMessage("Unable to delete event.", true);
        }
    }

    posterInput.addEventListener("change", function () {
        const file = posterInput.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showMessage("Please choose a valid image file.", true);
            posterInput.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage("Please choose an image smaller than 5 MB.", true);
            posterInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = function () {
            showPoster(reader.result);
            showMessage("Poster preview ready.");
        };

        reader.onerror = function () {
            showMessage("Could not read this image. Please try another.", true);
        };

        reader.readAsDataURL(file);
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        saveEvent("Published");
    });

    document.getElementById("saveFestDraft").addEventListener("click", function () {
        saveEvent("Draft");
    });

    document.getElementById("cancelFestEdit").addEventListener("click", resetForm);

    loadEvents();
});
