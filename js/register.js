document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("registrationForm");
    const eventSelect = document.getElementById("event");
    const confirmation = document.getElementById("confirmation");
    const confirmationDetails = document.getElementById("confirmationDetails");
    const lookupSection = document.getElementById("findRegistration");
    const lookupIdentifier = document.getElementById("lookupIdentifier");
    const lookupButton = document.getElementById("lookupButton");
    const lookupMessage = document.getElementById("lookupMessage");
    const lookupResults = document.getElementById("lookupResults");

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
    function showConfirmation(studentData, eventData, registration, isDuplicate = false, isLookup = false) {

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

        const confirmationHeading = confirmation.querySelector("h2");

        if (confirmationHeading) {
            confirmationHeading.textContent = isDuplicate
                ? "Already Registered!"
                : isLookup
                    ? "Registration Found!"
                    : "You're on the list!";
        }

        let duplicateNotice = document.getElementById("duplicateNotice");

        if (isDuplicate || isLookup) {
            if (!duplicateNotice) {
                duplicateNotice = document.createElement("p");
                duplicateNotice.id = "duplicateNotice";
                confirmationHeading.insertAdjacentElement(
                    "afterend",
                    duplicateNotice
                );
            }

            duplicateNotice.textContent = isDuplicate
                ? "You are already registered for this event. Here is your original registration slip."
                : "Your previous VYBE registration was found. Here is your original confirmation slip.";

            duplicateNotice.style.color = "#C47A28";
            duplicateNotice.style.fontWeight = "600";
            duplicateNotice.style.margin = "12px 0";
        } else if (duplicateNotice) {
            duplicateNotice.remove();
        }

        // Create the Download Slip button
        let downloadButton = document.getElementById("downloadSlip");

        if (!downloadButton) {
            downloadButton = document.createElement("button");
            downloadButton.id = "downloadSlip";
            downloadButton.type = "button";
            downloadButton.textContent = "Download Slip";
            downloadButton.style.marginLeft = "10px";

            const printButton = confirmation.querySelector("button");

            if (printButton) {
                printButton.insertAdjacentElement("afterend", downloadButton);
            } else {
                confirmation.appendChild(downloadButton);
            }
        }

        downloadButton.onclick = function () {
            const safeDetails = confirmationDetails.textContent.replace(
                /[&<>"']/g,
                function (character) {
                    return {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        '"': "&quot;",
                        "'": "&#39;"
                    }[character];
                }
            );

            const slipStatus = (isDuplicate || isLookup)
                ? "PREVIOUS REGISTRATION FOUND"
                : "REGISTRATION CONFIRMED";

            const slipHeading = isLookup ? "Your registration was found!" : isDuplicate
                ? "Your registration already exists!"
                : "You're on the list!";

            const slipSubtitle = (isDuplicate || isLookup)
                ? "This is your previously generated registration pass."
                : "Your festival journey starts here.";

            const slipHTML = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>VYBE | Official Registration Pass</title>

                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">

                    <style>
                        * {
                            box-sizing: border-box;
                        }

                        body {
                            margin: 0;
                            min-height: 100vh;
                            padding: 45px 18px;
                            font-family: 'Outfit', Arial, sans-serif;
                            color: #ffffff;
                            background:
                                radial-gradient(circle at 10% 10%, #54316e 0, transparent 35%),
                                radial-gradient(circle at 90% 90%, #7a315d 0, transparent 35%),
                                #100d20;
                        }

                        .pass {
                            max-width: 650px;
                            margin: 0 auto;
                            overflow: hidden;
                            border: 1px solid rgba(255,255,255,0.16);
                            border-radius: 25px;
                            background: #1d1931;
                            box-shadow: 0 25px 80px rgba(0,0,0,0.4);
                        }

                        .top {
                            position: relative;
                            padding: 35px 35px 30px;
                            overflow: hidden;
                            background: linear-gradient(125deg, #593b86, #a04483 60%, #d36c82);
                        }

                        .top:after {
                            content: "";
                            position: absolute;
                            width: 210px;
                            height: 210px;
                            right: -75px;
                            top: -100px;
                            border: 35px solid rgba(255,255,255,0.09);
                            border-radius: 50%;
                        }

                        .brand {
                            font-family: 'Space Grotesk', sans-serif;
                            font-size: 43px;
                            font-weight: 700;
                            letter-spacing: 5px;
                            margin: 0;
                        }

                        .tagline {
                            margin: 5px 0 25px;
                            color: #f6dcec;
                            letter-spacing: 3px;
                            font-size: 10px;
                            text-transform: uppercase;
                        }

                        .status {
                            display: inline-block;
                            padding: 9px 15px;
                            border: 1px solid rgba(255,255,255,0.4);
                            border-radius: 30px;
                            background: rgba(255,255,255,0.15);
                            font-size: 11px;
                            font-weight: 700;
                            letter-spacing: 1.5px;
                        }

                        .heading {
                            margin: 18px 0 5px;
                            font-family: 'Space Grotesk', sans-serif;
                            font-size: 28px;
                            font-weight: 700;
                        }

                        .subtitle {
                            margin: 0;
                            color: #f6dcec;
                            font-size: 14px;
                        }

                        .content {
                            padding: 30px 35px;
                        }

                        .section-label {
                            margin: 0 0 15px;
                            color: #e8b7d9;
                            font-size: 11px;
                            font-weight: 700;
                            letter-spacing: 2px;
                            text-transform: uppercase;
                        }

                        .details {
                            margin: 0;
                            padding: 22px;
                            border: 1px solid rgba(224,183,217,0.2);
                            border-radius: 16px;
                            background: #28223e;
                            color: #f5efff;
                            white-space: pre-wrap;
                            overflow-wrap: anywhere;
                            font-family: 'Outfit', Arial, sans-serif;
                            font-size: 14px;
                            line-height: 2;
                        }

                        .bottom {
                            padding: 23px 30px;
                            text-align: center;
                            border-top: 1px dashed rgba(255,255,255,0.22);
                            background: #171326;
                        }

                        .bottom strong {
                            display: block;
                            color: #f0c477;
                            font-family: 'Space Grotesk', sans-serif;
                            font-size: 17px;
                            letter-spacing: 2px;
                        }

                        .bottom p {
                            margin: 7px 0 0;
                            color: #bcb2cf;
                            font-size: 12px;
                        }

                        .print-note {
                            max-width: 650px;
                            margin: 20px auto 0;
                            text-align: center;
                            color: #d6c9e6;
                            font-size: 12px;
                        }

                        @media (max-width: 500px) {
                            body {
                                padding: 20px 12px;
                            }

                            .top {
                                padding: 27px 23px;
                            }

                            .content {
                                padding: 23px;
                            }

                            .brand {
                                font-size: 35px;
                            }

                            .heading {
                                font-size: 23px;
                            }

                            .details {
                                padding: 16px;
                                font-size: 13px;
                            }
                        }

                        @media print {
                            body {
                                padding: 0;
                                background: white;
                            }

                            .pass {
                                max-width: 100%;
                                box-shadow: none;
                                print-color-adjust: exact;
                                -webkit-print-color-adjust: exact;
                            }

                            .print-note {
                                display: none;
                            }
                        }
                    </style>
                </head>

                <body>
                    <main class="pass">
                        <header class="top">
                            <h1 class="brand">VYBE</h1>
                            <p class="tagline">Your Fest. Your Energy.</p>

                            <span class="status">
                                &#10003; 
                            </span>

                            <h2 class="heading">${slipHeading}</h2>
                            <p class="subtitle">
                                ${slipSubtitle}
                            </p>
                        </header>

                        <section class="content">
                            <p class="section-label">
                                ✦ YOUR REGISTRATION DETAILS
                            </p>

                            <pre class="details">${safeDetails}</pre>
                        </section>

                        <footer class="bottom">
                            <strong>SEE YOU AT VYBE!</strong>
                            <p>Celebrate talent. Create memories. Feel the energy.</p>
                        </footer>
                    </main>

                    <p class="print-note">
                        Your official VYBE registration confirmation pass.
                    </p>
                </body>
                </html>
            `;
            const blob = new Blob([slipHTML], {
                type: "text/html;charset=utf-8"
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = (isDuplicate || isLookup) ? "VYBE-Previous-Registration-Slip.html" : "VYBE-Registration-Slip.html";
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(function () {
                URL.revokeObjectURL(url);
            }, 1000);
        };

        // VYBE FESTIVAL PASSPORT
        let passportButton = document.getElementById("downloadFestivalPassport");

        if (!passportButton) {
            passportButton = document.createElement("button");
            passportButton.id = "downloadFestivalPassport";
            passportButton.type = "button";
            passportButton.textContent = "Download Festival Passport";
            passportButton.style.margin = "12px 0 0 10px";

            if (downloadButton) {
                downloadButton.insertAdjacentElement("afterend", passportButton);
            } else {
                confirmation.appendChild(passportButton);
            }
        }

        passportButton.onclick = function () {
            function escapePassport(value) {
                return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
                    return {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        '"': "&quot;",
                        "'": "&#39;"
                    }[character];
                });
            }

            const passportId = escapePassport(registration.id);
            const passportName = escapePassport(studentData.studentName);
            const passportNumber = escapePassport(studentData.registrationNumber);
            const passportEmail = escapePassport(studentData.email);
            const passportDepartment = escapePassport(studentData.department);
            const passportYear = escapePassport(studentData.year);
            const passportEvent = escapePassport(eventData.name);
            const passportDate = escapePassport(formattedEventDate);
            const passportTime = escapePassport(eventData.time);
            const passportVenue = escapePassport(eventData.venue);
            const passportStatus = (isDuplicate || isLookup)
                ? "PREVIOUSLY CONFIRMED"
                : "REGISTRATION CONFIRMED";

            const passportHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VYBE Festival Passport</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
<style>
*{box-sizing:border-box}
body{margin:0;padding:30px 15px;background:#f2edff;font-family:Arial,sans-serif;color:#28213c}
.pass{max-width:520px;margin:20px auto;background:white;border-radius:25px;overflow:hidden;box-shadow:0 18px 55px #38205b25}
.top{padding:35px 25px;text-align:center;color:white;background:linear-gradient(135deg,#39206d,#7545a8,#b65b9a)}
.brand{font-size:38px;font-weight:900;letter-spacing:7px;margin:0}
.tagline{margin:8px 0 25px;opacity:.9;letter-spacing:2px;font-size:12px}
.pass-label{display:inline-block;padding:8px 16px;border:1px solid #ffffff80;border-radius:30px;font-size:11px;letter-spacing:2px}
.top h2{font-size:25px;margin:18px 0 8px}
.top p{font-size:13px}
.content{padding:28px}
.status{padding:12px;background:#f0eafa;color:#633a91;text-align:center;border-radius:10px;font-size:12px;font-weight:bold;letter-spacing:1px}
.student{font-size:23px;font-weight:bold;margin:23px 0 5px;overflow-wrap:anywhere}
.muted{font-size:13px;color:#777}
.details{display:grid;grid-template-columns:1fr 1fr;gap:18px 12px;margin-top:25px}
.label{font-size:10px;color:#927ca8;letter-spacing:1px;font-weight:bold}
.value{font-size:14px;font-weight:bold;margin-top:6px;overflow-wrap:anywhere}
.event{margin-top:25px;padding:20px;background:#f8f5fc;border-radius:15px}
.event h3{margin:0 0 18px;color:#633a91}
.qr-area{text-align:center;padding:25px 10px 10px}
#qrcode{display:flex;justify-content:center;margin:15px auto}
#qrcode img,#qrcode canvas{margin:auto}
.qr-note{font-size:11px;color:#777}
.bottom{text-align:center;background:#39206d;color:white;padding:22px;font-weight:bold;letter-spacing:1px}
.actions{text-align:center;margin:20px}
button{border:0;border-radius:25px;padding:13px 24px;background:#633a91;color:white;font-weight:bold;cursor:pointer}
@media print{body{padding:0;background:white}.pass{margin:0 auto;box-shadow:none;break-inside:avoid}.actions{display:none}}
</style>
</head>
<body>
<main class="pass">
<header class="top">
<h1 class="brand">VYBE</h1>
<p class="tagline">YOUR FEST. YOUR ENERGY.</p>
<span class="pass-label">OFFICIAL FESTIVAL PASSPORT</span>
<h2>Your VYBE Journey Starts Here!</h2>
<p>Celebrate talent. Create memories.</p>
</header>
<section class="content">
<div class="status">&#10003; ${passportStatus}</div>
<div class="student">${passportName}</div>
<div class="muted">College Registration No: ${passportNumber}</div>
<div class="details">
<div><div class="label">EMAIL</div><div class="value">${passportEmail}</div></div>
<div><div class="label">DEPARTMENT</div><div class="value">${passportDepartment}</div></div>
<div><div class="label">ACADEMIC YEAR</div><div class="value">${passportYear}</div></div>
<div><div class="label">REGISTRATION ID</div><div class="value">${passportId}</div></div>
</div>
<div class="event">
<h3>✦ YOUR FESTIVAL EVENT</h3>
<div class="label">EVENT</div><div class="value">${passportEvent}</div>
<div style="height:15px"></div>
<div class="label">DATE</div><div class="value">${passportDate}</div>
<div style="height:15px"></div>
<div class="label">TIME</div><div class="value">${passportTime}</div>
<div style="height:15px"></div>
<div class="label">VENUE</div><div class="value">${passportVenue}</div>
</div>
<div class="qr-area">
<strong>YOUR UNIQUE VYBE QR CODE</strong>
<div id="qrcode"></div>
<p class="qr-note">Keep this passport with you during the festival.</p>
<p class="qr-note">QR contains your registration ID for identification.</p>
</div>
</section>
<footer class="bottom">SEE YOU AT VYBE! ✦</footer>
</main>
<div class="actions"><button onclick="window.print()">Print Passport</button></div>
<script>
if (typeof QRCode !== "undefined") {
    new QRCode(document.getElementById("qrcode"), {
        text: ${JSON.stringify(String(registration.id))},
        width: 170,
        height: 170,
        correctLevel: QRCode.CorrectLevel.M
    });
} else {
    document.getElementById("qrcode").textContent =
        "QR code requires an internet connection. Registration ID: " + ${JSON.stringify(String(registration.id))};
}
<\/script>
</body>
</html>`;

            const passportBlob = new Blob([passportHTML], {
                type: "text/html;charset=utf-8"
            });

            const passportURL = URL.createObjectURL(passportBlob);
            const passportLink = document.createElement("a");
            passportLink.href = passportURL;
            passportLink.download = "VYBE-Festival-Passport-" + String(registration.id).replace(/[^a-zA-Z0-9_-]/g, "") + ".html";
            document.body.appendChild(passportLink);
            passportLink.click();
            passportLink.remove();

            setTimeout(function () {
                URL.revokeObjectURL(passportURL);
            }, 2000);
        };
        confirmation.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    // FIND MY VYBE REGISTRATION
    if (lookupButton) {
        lookupButton.addEventListener("click", function () {

            const searchValue = lookupIdentifier.value.trim().toLowerCase();

            lookupMessage.textContent = "";
            lookupResults.replaceChildren();

            if (!searchValue) {
                lookupMessage.textContent =
                    "Please enter your college registration number or email.";
                lookupMessage.style.color = "#D94848";
                return;
            }

            if (
                !window.FestStorage ||
                typeof window.FestStorage.getAllRegistrations !== "function"
            ) {
                lookupMessage.textContent =
                    "Registration storage is not available right now.";
                lookupMessage.style.color = "#D94848";
                return;
            }

            const allRegistrations =
                window.FestStorage.getAllRegistrations();

            const matchingRegistrations = allRegistrations.filter(registration => {
                const registrationNumber =
                    String(registration.registrationNumber || "")
                        .trim()
                        .toLowerCase();

                const email =
                    String(registration.email || "")
                        .trim()
                        .toLowerCase();

                return registrationNumber === searchValue ||
                    email === searchValue;
            });

            if (matchingRegistrations.length === 0) {
                lookupMessage.textContent =
                    "No previous registration was found. Please check your details.";
                lookupMessage.style.color = "#D94848";
                return;
            }

            lookupMessage.textContent =
                matchingRegistrations.length === 1
                    ? "Your registration was found!"
                    : matchingRegistrations.length + " registrations were found!";

            lookupMessage.style.color = "#55C995";

            matchingRegistrations.forEach(function (registration) {

                const eventData = Array.isArray(window.CULTURAL_EVENTS)
                    ? window.CULTURAL_EVENTS.find(item =>
                        String(item.id) === String(registration.eventId)
                    )
                    : null;

                const resultCard = document.createElement("div");
                resultCard.className = "lookup-result-card";

                const eventTitle = document.createElement("p");
                eventTitle.textContent =
                    "Event: " + (registration.eventName || "VYBE Event");

                const registrationId = document.createElement("p");
                registrationId.textContent =
                    "Registration ID: " + registration.id;

                const viewButton = document.createElement("button");
                viewButton.type = "button";
                viewButton.textContent = "View My Original Slip ↗";

                viewButton.addEventListener("click", function () {

                    if (!eventData) {
                        lookupMessage.textContent =
                            "Event details are unavailable. Please contact the organizer.";
                        lookupMessage.style.color = "#D94848";
                        return;
                    }

                    lookupSection.hidden = true;

                    showConfirmation(
                        registration,
                        eventData,
                        registration,
                        false,
                        true
                    );
                });

                resultCard.appendChild(eventTitle);
                resultCard.appendChild(registrationId);
                resultCard.appendChild(viewButton);

                lookupResults.appendChild(resultCard);
            });
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

            if (
                result &&
                result.success === false &&
                /already registered/i.test(result.message || "")
            ) {
                const previousRegistration =
                    typeof window.FestStorage.getAllRegistrations === "function"
                        ? window.FestStorage.getAllRegistrations().find(registration =>
                            String(registration.registrationNumber || "").trim().toLowerCase() ===
                                studentData.registrationNumber.trim().toLowerCase() &&
                            String(registration.eventId) === String(selectedEvent)
                        )
                        : null;

                if (previousRegistration) {
                    showConfirmation(
                        previousRegistration,
                        selectedEventData,
                        previousRegistration,
                        true
                    );
                } else {
                    showMessage(
                        "Already registered for this event, but the original slip could not be retrieved.",
                        "#C47A28"
                    );
                }

                return;
            }

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









