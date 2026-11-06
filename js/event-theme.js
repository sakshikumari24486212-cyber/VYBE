(() => {
    const themes = {
        dance: {
            title: "Dance Competition",
            symbol: "💃",
            tagline: "Feel the rhythm. Own the stage. Let your moves tell the story."
        },
        singing: {
            title: "Singing Competition",
            symbol: "🎤",
            tagline: "Find your voice, share your sound and make the stage yours."
        },
        fashion: {
            title: "Fashion Show",
            symbol: "✨",
            tagline: "Bring your creativity to the runway and make a statement."
        },
        drama: {
            title: "Drama Competition",
            symbol: "🎭",
            tagline: "Step into character and bring your story to life."
        },
        photography: {
            title: "Photography Competition",
            symbol: "📸",
            tagline: "Capture a moment. Share a perspective. Tell a story."
        },
        art: {
            title: "Art Competition",
            symbol: "🎨",
            tagline: "Turn your imagination into something unforgettable."
        }
    };

    function applyEventTheme() {
        const eventId = new URLSearchParams(window.location.search)
            .get("event")
            ?.trim()
            .toLowerCase();

        const event = themes[eventId];

        if (!event) return;

        document.body.dataset.eventTheme = eventId;

        if (document.querySelector(".event-theme-banner")) return;

        const banner = document.createElement("section");
        banner.className = "event-theme-banner";
        banner.dataset.symbol = event.symbol;
        banner.setAttribute("aria-label", event.title);

        const kicker = document.createElement("span");
        kicker.className = "event-theme-kicker";
        kicker.textContent = "VYBE 2026 · YOUR EVENT";

        const heading = document.createElement("h2");
        heading.textContent = event.title;

        const description = document.createElement("p");
        description.textContent = event.tagline;

        banner.append(kicker, heading, description);

        const formCard = document.querySelector(
            ".form-card, .registration-card, .form-container"
        );

        if (formCard?.parentNode) {
            formCard.parentNode.insertBefore(banner, formCard);
        } else {
            document.body.prepend(banner);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyEventTheme);
    } else {
        applyEventTheme();
    }
})();
