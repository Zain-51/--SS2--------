// ✅ التأكد من تحميل الصفحة قبل تنفيذ أي كود
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Smart Schedule is ready!");

    applyDarkMode(); // استعادة الوضع الداكن إذا كان مفعلًا مسبقًا

    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
     //Repo Test2
    // تحميل البيانات بناءً على الصفحة الحالية
    const currentPage = window.location.pathname.split("/").pop();
    switch (currentPage) {
        case "subjects":
            generateSubjectInputs();
            break;
        case "sections":
            if (getSubjects().length > 0) {
                generateScheduleTable();
            } else {
                redirectTo("subjects", "No subjects found. Redirecting to subject input page.");
            }
            break;
        case "preferences":
            // في انتظار تفاعل المستخدم مع التفضيلات
            break;
        case "timetables":
            if (getSubjects().length > 0 && getSchedules() && getPreferences()) {
                generateTimetables();
            } else {
                redirectTo("subjects", "No data found. Redirecting to start.");
            }
            break;
        default:
            console.log("Welcome to Smart Schedule!");
    }
});

// ======================================================
// ✅ وظائف عاااامة (General Functions)
// ======================================================
function getSubjects() {
    return JSON.parse(localStorage.getItem("subjects")) || [];
}

function getSchedules() {
    return JSON.parse(localStorage.getItem("schedules")) || {};
}

function getPreferences() {
    return JSON.parse(localStorage.getItem("preferences")) || {};
}

function redirectTo(page, message) {
    alert(message);
    window.location.href = page;
}

// ======================================================
// 🚀 1️⃣ صفحة إدخال المواد (subjects.html)
// ======================================================
function generateSubjectInputs() {
    const subjectCount = document.getElementById("subjectCount")?.value || 2;
    const container = document.getElementById("subjects-container");
    if (!container) return;

    container.innerHTML = ""; // إعادة تعيين الحقول

    for (let i = 1; i <= subjectCount; i++) {
        container.innerHTML += `
            <label for="subject${i}">Subject ${i}:</label>
            <input type="text" id="subject${i}" placeholder="Enter subject ${i}">
        `;
    }
}

function submitSubjects() {
    const subjectCount = document.getElementById("subjectCount").value;
    const subjects = [];

    for (let i = 1; i <= subjectCount; i++) {
        const subject = document.getElementById(`subject${i}`).value.trim();
        if (subject !== "") {
            subjects.push(subject);
        }
    }

    if (subjects.length > 0) {
        localStorage.setItem("subjects", JSON.stringify(subjects));
        window.location.href = "sections";
    } else {
        alert("⚠️ Please enter at least one subject.");
    }
}

// ======================================================
// 🚀 2️⃣ صفحة تحديد الجدول الزمني (sections.html)
// ======================================================
let currentSubjectIndex = 0;
let schedules = getSchedules();

function generateScheduleTable() {
    const scheduleBody = document.getElementById("schedule-body");
    if (!scheduleBody) return;

    scheduleBody.innerHTML = ""; // إعادة تعيين الجدول

    const times = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    const subjects = getSubjects();

    times.forEach(time => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${time}</td>`;

        days.forEach(day => {
            const cell = document.createElement("td");
            cell.textContent = "+";
            cell.dataset.day = day;
            cell.dataset.time = time;

            cell.addEventListener("click", () => {
                cell.classList.toggle("selected");
                cell.textContent = cell.classList.contains("selected") ? "✔" : "+";
            });

            row.appendChild(cell);
        });

        scheduleBody.appendChild(row);
    });

    document.getElementById("subject-title").textContent = `Input sections for ${subjects[currentSubjectIndex]}`;
}

function nextSubject() {
    saveCurrentSchedule();
    const subjects = getSubjects();

    if (currentSubjectIndex < subjects.length - 1) {
        currentSubjectIndex++;
        generateScheduleTable();
    } else {
        localStorage.setItem("schedules", JSON.stringify(schedules)); // Save schedules to localStorage
        console.log("Final schedules saved to localStorage:", schedules); // Debug: Check final schedules
        window.location.href = "preferences";
    }
}

function saveCurrentSchedule() {
    const selectedCells = document.querySelectorAll(".selected");
    const currentSubject = getSubjects()[currentSubjectIndex];

    schedules[currentSubject] = Array.from(selectedCells).map(cell => ({
        day: cell.dataset.day,
        time: cell.dataset.time
    }));
}

// ======================================================
// 🚀 3️⃣ صفحة التفضيلات (preferences.html)
// ======================================================
function submitPreferences() {
    const timePreference = document.querySelector('input[name="time"]:checked');
    const gapPreference = document.querySelector('input[name="gap"]:checked');
    const dayOffPreference = document.querySelector('input[name="dayoff"]:checked');

    if (timePreference && gapPreference && dayOffPreference) {
        const preferences = {
            time: timePreference.value,
            gap: gapPreference.value,
            dayOff: dayOffPreference.value
        };

        localStorage.setItem("preferences", JSON.stringify(preferences));
        window.location.href = "timetables";
    } else {
        alert("⚠️ Please select all preferences before proceeding.");
    }
}

// ======================================================
// 🚀 4️⃣ صفحة الجداول النهائية (timetables.html)
// ======================================================
async function generateTimetables() {
    const container = document.getElementById("timetables-container");
    if (!container) return;

    try {
        // Fetch timetable data from the backend
        const data = await sendUserData();

        const { days, times, subjects, schedules } = data;

        // Create a single timetable
        const timetable = document.createElement("div");
        timetable.classList.add("timetable");
        timetable.id = `timetable-1`;

        timetable.innerHTML = `<h3>📊 Your Timetable</h3>
            <table>
                <thead>
                    <tr>
                        <th>Time</th>
                        ${days.map(day => `<th>${day}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${times.map(time => `
                        <tr>
                            <td>${time}</td>
                            ${days.map(day => `<td data-day="${day}" data-time="${time}">+</td>`).join('')}
                        </tr>`).join('')}
                </tbody>
            </table>`;

        container.appendChild(timetable);

        // Use user schedules to populate the timetable
        scheduleUserSubjects(timetable, schedules);
    } catch (error) {
        console.error("Failed to fetch timetable data:", error);
    }
}



function scheduleUserSubjects(timetable, schedules) {
    const cells = timetable.querySelectorAll("td[data-day][data-time]");

    console.log("Schedules from localStorage:", schedules); // Debug: Check the schedules data

    // Iterate over each subject and its scheduled times
    Object.entries(schedules).forEach(([subject, slots]) => {
        console.log(`Processing subject: ${subject}`); // Debug: Check which subject is being processed
        console.log(`Slots for ${subject}:`, slots); // Debug: Check the slots for the subject

        slots.forEach(slot => {
            const { day, time } = slot;
            console.log(`Looking for cell: ${day} at ${time}`); // Debug: Check which cell is being searched

            const cell = timetable.querySelector(`td[data-day="${day}"][data-time="${time}"]`);

            if (cell && cell.textContent === "+") {
                console.log(`Assigning ${subject} to ${day} at ${time}`); // Debug: Confirm assignment
                cell.textContent = subject;
                cell.classList.add("scheduled");
            } else {
                console.log(`Cell not found or already occupied: ${day} at ${time}`); // Debug: Check why the cell wasn't assigned
            }
        });
    });
}
function saveCurrentSchedule() {
    const selectedCells = document.querySelectorAll(".selected");
    const currentSubject = getSubjects()[currentSubjectIndex];

    // Save the selected cells for the current subject
    schedules[currentSubject] = Array.from(selectedCells).map(cell => ({
        day: cell.dataset.day,
        time: cell.dataset.time
    }));

    console.log("Updated schedules:", schedules); // Debug: Check the updated schedules
}

async function sendUserData() {
    const subjects = JSON.parse(localStorage.getItem("subjects")) || [];
    const schedules = JSON.parse(localStorage.getItem("schedules")) || {};

    const response = await fetch('/generate-timetable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subjects, schedules }),
    });

    const data = await response.json();
    console.log("Timetable data from backend:", data);
    return data;
}

// ======================================================
// 🗂️ تصدير الجدول كـ PDF
// ======================================================
function exportTimetableAsPDF() {
    const element = document.getElementById("timetables-container");
    const options = {
        margin: 0.5,
        filename: 'Smart_Schedule.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    html2pdf().from(element).set(options).save();
}

// ======================================================
// 🔗 مشاركة الجدول على وسائل التواصل
// ======================================================
function shareTimetable() {
    const shareText = "Check out my Smart Schedule! 📅 #SmartSchedule";
    const shareUrl = window.location.href;

    if (navigator.share) {
        navigator.share({
            title: 'My Smart Schedule',
            text: shareText,
            url: shareUrl
        }).then(() => console.log('✅ Shared successfully!'))
          .catch(err => console.error('❌ Share failed:', err));
    } else {
        alert("Sharing is not supported on this browser.");
    }
}

// ======================================================
// 📅 دمج مع Google Calendar
// ======================================================
function addToGoogleCalendar() {
    const calendarUrl = "https://calendar.google.com/calendar/r/eventedit";
    const subject = "Smart Schedule Event";
    const startTime = "20240301T090000Z";
    const endTime = "20240301T110000Z";
    const location = "Online";
    const details = "My course schedule generated using Smart Schedule.";

    const googleCalendarLink = `${calendarUrl}?text=${encodeURIComponent(subject)}&dates=${startTime}/${endTime}&location=${encodeURIComponent(location)}&details=${encodeURIComponent(details)}`;

    window.open(googleCalendarLink, "_blank");
}

// ======================================================
// 🌙 الوضع الداكن (Dark Mode)
// ======================================================
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

function applyDarkMode() {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}