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

     // Add this for section-input.html جديد
  const sectionCountInput = document.getElementById('section-count');
  if (sectionCountInput) {
    sectionCountInput.addEventListener('input', generateSectionInputs);
    generateSectionInputs(); // Initialize on page load
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

function loadSubject() {
    const subjects = getSubjects();
    const subjectIndex = new URLSearchParams(window.location.search).get('subject') || 0;
    const subjectName = subjects[subjectIndex] || '[No Subject]';
    document.getElementById('current-subject').textContent = subjectName;
}

// ======================================================
// ✅ PAGE INITIALIZATION (DOMContentLoaded)
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Smart Schedule initialized");
    
    // Load current subject name (for sections-input.html)
    loadSubject();
    
    // Initialize dynamic inputs based on current page
    const currentPage = window.location.pathname.split("/").pop();
    
    if (currentPage === "subjects.html" || currentPage === "subjects") {
        generateSubjectInputs();
    }
    else if (currentPage === "sections-input.html" || currentPage === "sections-input") {
        generateSectionInputs();
        // Initialize section count input listener
        const sectionCountInput = document.getElementById('section-count');
        if (sectionCountInput) {
            sectionCountInput.addEventListener('input', generateSectionInputs);
            generateSectionInputs(); // Initial generation
        }
    }
    else if (currentPage === "sections.html" || currentPage === "sections") {
        if (getSubjects().length > 0) {
            generateScheduleTable();
        }
    }
    
    // Initialize dark mode if the toggle exists
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
        applyDarkMode(); // Apply saved mode
    }
});


// ======================================================
// 🆕 NEW: Section Input Generation Logic الجديدة حقت sections-input.html
// ======================================================
function generateSectionInputs() {
    const count = document.getElementById('section-count').value;
    const container = document.getElementById('section-names-container');
    const currentSubject = document.getElementById('current-subject').textContent;
    
    container.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
      container.innerHTML += `
        <label>Section ${i}:</label>
        <input type="text" id="section-${i}" placeholder="e.g., ${currentSubject} ${3300 + i}">
      `;
    }
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
        window.location.href = "sections-input?subject=0"; // Redirect to the first subject's section input page
    } else {
        alert("⚠️ Please enter at least one subject.");
    }
}

// ======================================================
// 🚀 SECTIONS-INPUT PAGE (sections-input.html) - FIXED
// ======================================================
let currentSubjectIndex = 0;

function submitSections() {

    // Debugging: Check if DOM is loaded
    console.log("Document body:", document.body.innerHTML); // Check if DOM loaded
    const sectionCountInput = document.getElementById("section-count");
    if (!sectionCountInput) {
        console.error("Missing elements:", {
            'section-count': document.getElementById("section-count"),
            'current-subject': document.getElementById("current-subject")
        });
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const subjectIndex = parseInt(params.get("subject")) || 0;
    const subjects = getSubjects();
    const currentSubject = subjects[subjectIndex];
    
    // 1. Save the current sections
    const sectionCount = sectionCountInput.value;
    const sections = {};
    const allSchedules = getSchedules()
    Object.assign(allSchedules, sections);
    localStorage.setItem("schedules", JSON.stringify(allSchedules));
    
    for (let i = 1; i <= sectionCount; i++) {
        const sectionName = document.getElementById(`section-${i}`).value.trim();
        if (sectionName) {
            // Store as "Subject - Section" (e.g. "Math - 3301")
            sections[`${currentSubject} - ${sectionName}`] = []; // Empty slots for now
        }
    }
    
    // 2. Merge with existing data
    const allSections = getSchedules();
    Object.assign(allSections, sections);
    localStorage.setItem("schedules", JSON.stringify(allSections));
    
    // 3. Debug output
    console.log("Saved sections:", allSections);
    
    // 4. Redirect logic
    if (subjectIndex < subjects.length - 1) {
        window.location.href = `/sections-input?subject=${subjectIndex + 1}`;
    } else {
        window.location.href = "sections";
    }
}

// Initialize section inputs
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const subjectIndex = parseInt(params.get("subject")) || 0;
    const subjects = getSubjects();
    
    if (subjects.length > 0) {
        document.getElementById("current-subject").textContent = subjects[subjectIndex];
    }
    
    // Initialize section count listener
    const sectionCountInput = document.getElementById("section-count");
    if (sectionCountInput) {
        sectionCountInput.addEventListener("input", generateSectionInputs);
        generateSectionInputs(); // Initial generation
    }
});

// ======================================================
// 🚀 2️⃣ صفحة تحديد الجدول الزمني (sections.html) - UPDATED
// ======================================================
let currentSectionIndex = 0;
let allSections = [];

function initializeSectionPage() {
    // Load all sections from storage
    const schedules = getSchedules();
    allSections = Object.keys(schedules);
    
    // Set up event listeners
    document.getElementById('next-btn').addEventListener('click', nextSection);
    document.getElementById('prev-btn').addEventListener('click', prevSection);
    
    // Initial UI update
    updateSectionUI();
}

function updateSectionUI() {
    if (allSections.length === 0) {
        console.error("No sections found!");
        return;
    }
    
    const currentSection = allSections[currentSectionIndex];
    
    // Update UI elements
    document.getElementById('current-section').textContent = currentSection;
    document.getElementById('current-section-number').textContent = currentSectionIndex + 1;
    document.getElementById('total-sections').textContent = allSections.length;
    
    // Update button states
    document.getElementById('prev-btn').disabled = currentSectionIndex === 0;
    document.getElementById('next-btn').textContent = 
        currentSectionIndex === allSections.length - 1 ? "Finish" : "Next Section";
    
    // Generate the schedule table
    generateScheduleTable(currentSection);
}

function generateScheduleTable(currentSection) {
    const scheduleBody = document.getElementById("schedule-body");
    if (!scheduleBody) return;

    scheduleBody.innerHTML = "";

    const times = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
                  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    const schedules = getSchedules();

    times.forEach(time => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${time}</td>`;

        days.forEach(day => {
            const cell = document.createElement("td");
            cell.textContent = "+";
            cell.dataset.day = day;
            cell.dataset.time = time;

            // Check if this slot is already selected
            const sectionSlots = schedules[currentSection] || [];
            const isSelected = sectionSlots.some(slot => 
                slot.day === day && slot.time === time);
            
            if (isSelected) {
                cell.classList.add("selected");
                cell.textContent = "✔";
            }

            cell.addEventListener("click", () => {
                cell.classList.toggle("selected");
                cell.textContent = cell.classList.contains("selected") ? "✔" : "+";
            });

            row.appendChild(cell);
        });

        scheduleBody.appendChild(row);
    });
}

function nextSection() {
    saveCurrentSchedule();
    
    if (currentSectionIndex < allSections.length - 1) {
        currentSectionIndex++;
        updateSectionUI();
    } else {
        window.location.href = "preferences";
    }
}

function prevSection() {
    saveCurrentSchedule();
    
    if (currentSectionIndex > 0) {
        currentSectionIndex--;
        updateSectionUI();
    }
}

function saveCurrentSchedule() {
    const selectedCells = document.querySelectorAll(".selected");
    const currentSection = allSections[currentSectionIndex];
    const schedules = getSchedules();

    schedules[currentSection] = Array.from(selectedCells).map(cell => ({
        day: cell.dataset.day,
        time: cell.dataset.time
    }));
    
    localStorage.setItem("schedules", JSON.stringify(schedules));
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("sections")) {
        initializeSectionPage();
    }
});

//temprorary debugging code
document.getElementById('prev-btn').addEventListener('click', (e) => {
    e.preventDefault(); // Test if this fixes it
    console.log("Prev clicked"); // Verify this logs
    prevSection();
});

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
//               دالة كشف التعارضات 
// ======================================================

function detectConflicts(schedules) {
    const conflicts = [];
    const subjects = Object.keys(schedules);

    // Compare each subject's slots with every other subject's slots
    for (let i = 0; i < subjects.length; i++) {
        for (let j = i + 1; j < subjects.length; j++) {
            const subjectA = subjects[i];
            const subjectB = subjects[j];
            const slotsA = schedules[subjectA];
            const slotsB = schedules[subjectB];

            // Check for overlapping slots
            const overlappingSlots = slotsA.filter(slotA =>
                slotsB.some(slotB => slotA.day === slotB.day && slotA.time === slotB.time)
            );

            if (overlappingSlots.length > 0) {
                conflicts.push({
                    subjectA,
                    subjectB,
                    overlappingSlots
                });
            }
        }
    }

    return conflicts;
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

        // Detect conflicts
        const conflicts = detectConflicts(schedules);

        if (conflicts.length > 0) {
            // Display conflict warning
            alert(`⚠️ Conflicts detected between subjects: ${conflicts.map(c => `${c.subjectA} and ${c.subjectB}`).join(", ")}`);

            // Generate alternative timetables for each conflict
            conflicts.forEach((conflict, index) => {
                const { subjectA, subjectB } = conflict;

                // Timetable 1: Include subjectA, exclude subjectB
                const timetable1 = createTimetable(days, times, subjects, schedules, subjectB);
                timetable1.innerHTML = `<h3>📊 Timetable ${index + 1} (${subjectA} included, ${subjectB} excluded)</h3>` + timetable1.innerHTML;
                container.appendChild(timetable1);

                // Timetable 2: Include subjectB, exclude subjectA
                const timetable2 = createTimetable(days, times, subjects, schedules, subjectA);
                timetable2.innerHTML = `<h3>📊 Timetable ${index + 2} (${subjectB} included, ${subjectA} excluded)</h3>` + timetable2.innerHTML;
                container.appendChild(timetable2);
            });
        } else {
            // No conflicts, generate a single timetable
            const timetable = createTimetable(days, times, subjects, schedules);
            timetable.innerHTML = `<h3>📊 Your Timetable</h3>` + timetable.innerHTML;
            container.appendChild(timetable);
        }
    } catch (error) {
        console.error("Failed to fetch timetable data:", error);
    }
}

function createTimetable(days, times, subjects, schedules, excludeSubject = null) {
    const timetable = document.createElement("div");
    timetable.classList.add("timetable");

    timetable.innerHTML = `
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

    // Populate the timetable with user schedules
    scheduleUserSubjects(timetable, schedules, excludeSubject);

    return timetable;
}

function scheduleUserSubjects(timetable, schedules, excludeSubject = null) {
    const cells = timetable.querySelectorAll("td[data-day][data-time]");

    Object.entries(schedules).forEach(([subject, slots]) => {
        if (subject === excludeSubject) return; // Skip the excluded subject

        slots.forEach(slot => {
            const { day, time } = slot;
            const cell = timetable.querySelector(`td[data-day="${day}"][data-time="${time}"]`);

            if (cell && cell.textContent === "+") {
                cell.textContent = subject;
                cell.classList.add("scheduled");
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