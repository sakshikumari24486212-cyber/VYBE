document.addEventListener("DOMContentLoaded", () => {
    
    // MOBILE NAVIGATION
    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");

    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", () => {
            const isOpen = mainNav.classList.toggle("show");

            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );
        });

        mainNav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                mainNav.classList.remove("show");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.setAttribute("aria-label", "Open navigation menu");
            });
        });
    }

    const eventGrid = document.getElementById("eventGrid");
    const searchInput = document.getElementById("eventSearch");
    const categorySelect = document.getElementById("eventCategory");
    const eventCount = document.getElementById("eventCount");

    if (!eventGrid || !searchInput || !categorySelect) {
        return;
    }

    const events = Array.isArray(window.CULTURAL_EVENTS)
        ? window.CULTURAL_EVENTS
        : [];

    const categoryStyles = {
        dance: {
            iconBackground: "rgba(237, 85, 166, 0.16)",
            glow: "rgba(237, 85, 166, 0.16)"
        },
        music: {
            iconBackground: "rgba(117, 70, 245, 0.2)",
            glow: "rgba(117, 70, 245, 0.2)"
        },
        fashion: {
            iconBackground: "rgba(255, 155, 80, 0.16)",
            glow: "rgba(255, 155, 80, 0.16)"
        },
        drama: {
            iconBackground: "rgba(237, 85, 166, 0.16)",
            glow: "rgba(237, 85, 166, 0.16)"
        },
        photography: {
            iconBackground: "rgba(117, 70, 245, 0.2)",
            glow: "rgba(117, 70, 245, 0.2)"
        },
        art: {
            iconBackground: "rgba(255, 155, 80, 0.16)",
            glow: "rgba(255, 155, 80, 0.16)"
        }
    };

    function createEventCard(event) {
        const style = categoryStyles[event.category] || categoryStyles.art;
        const card = document.createElement("article");
        card.className = "event-card";
        card.style.setProperty("--event-icon-bg", style.iconBackground);
        card.style.setProperty("--event-glow", style.glow);

        const top = document.createElement("div");
        top.className = "event-card-top";

        const icon = document.createElement("span");
        icon.className = "event-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = event.icon || "✦";

        const category = document.createElement("span");
        category.className = "event-category";
        category.textContent = event.categoryLabel || "Event";

        top.append(icon, category);

        const title = document.createElement("h3");
        title.textContent = event.name;

        const description = document.createElement("p");
        description.textContent = event.description || "Discover this VYBE competition.";

        const meta = document.createElement("div");
        meta.className = "event-meta";

        [event.date, event.time, event.venue].forEach((detail, index) => {
            const line = document.createElement("span");
            const labels = ["Date", "Time", "Venue"];
            line.textContent = `${labels[index]}: ${detail || "To be announced"}`;
            meta.appendChild(line);
        });

        const footer = document.createElement("div");
        footer.className = "event-card-footer";

        const capacity = document.createElement("span");
        capacity.className = "event-capacity";
        capacity.textContent = `${event.capacity} available seats`;

        const register = document.createElement("a");
        register.className = "event-register";
        register.href = `register.html?event=${encodeURIComponent(event.id)}`;
        register.textContent = "Register Now ↗";

        footer.append(capacity, register);
        card.append(top, title, description, meta, footer);

        return card;
    }

    function renderEvents() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedCategory = categorySelect.value;

        const filteredEvents = events.filter((event) => {
            const matchesCategory =
                selectedCategory === "all" ||
                event.category === selectedCategory;

            const searchableText = [
                event.name,
                event.categoryLabel,
                event.description,
                event.venue
            ].join(" ").toLowerCase();

            return matchesCategory && searchableText.includes(searchTerm);
        });

        eventGrid.replaceChildren();

        if (filteredEvents.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "event-empty";
            emptyMessage.textContent = "No competitions match your search. Try another keyword or category.";
            eventGrid.appendChild(emptyMessage);
        } else {
            filteredEvents.forEach((event) => {
                eventGrid.appendChild(createEventCard(event));
            });
        }

        if (eventCount) {
            eventCount.textContent =
                `Showing ${filteredEvents.length} of ${events.length} competitions`;
        }
    }

    searchInput.addEventListener("input", renderEvents);
    categorySelect.addEventListener("change", renderEvents);

    renderEvents();
});
// VYBE ANIMATED STATISTICS
document.addEventListener("DOMContentLoaded", () => {

    const counters = document.querySelectorAll(".stat-number[data-count]");

    const observer = new IntersectionObserver((entries, observer) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                const counter = entry.target;
                const target = Number(counter.dataset.count);
                const duration = 1500;
                const startTime = performance.now();

                function updateCounter(currentTime) {

                    const progress = Math.min(
                        (currentTime - startTime) / duration,
                        1
                    );

                    const easedProgress = 1 - Math.pow(1 - progress, 3);

                    counter.textContent = Math.floor(
                        easedProgress * target
                    );

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                }

                requestAnimationFrame(updateCounter);
                observer.unobserve(counter);
            }
        });

    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));

});