document.getElementById('paperForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const subject = document.getElementById('subject').value;
    const chapters = Array.from(document.querySelectorAll('input[name="chapters"]:checked')).map(cb => cb.value);
    const paperType = document.querySelector('input[name="type"]:checked').value;

    if (chapters.length === 0) {
        alert("Please select at least one chapter.");
        return;
    }

    generatePaper(subject, chapters, paperType);
});

function generatePaper(subject, selectedChapters, paperType) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // ---------------- HEADER ----------------
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.text('Sardar Shah Mohammad Khan Late Government Boys High School, Ghel Topi', pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(14);
    doc.text('Grade 9 Computer Examination', pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.text(`Name: _____________________     Roll No: _______     Date: __________`, margin, y);
    y += 12;
    doc.text('Time Allowed: 2 hours', margin, y);
    y += 10;

    // ---------------- OBJECTIVE SECTION ----------------
    if (paperType === 'objective' || paperType === 'both') {
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('Section A: Objective Paper (15 marks)', margin, y);
        y += 8;
        doc.setFontSize(11);
        doc.setFont('times', 'normal');
        doc.text('Instructions: Attempt ALL questions. Each question carries 1.5 marks. Circle the correct option.', margin, y);
        y += 10;

        // Gather MCQs from selected chapters
        let mcqs = [];
        selectedChapters.forEach(ch => mcqs = mcqs.concat(QUESTIONS[subject][ch].objective));
        mcqs = shuffleArray(mcqs).slice(0, 10);

        mcqs.forEach((q, i) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(`${i + 1}. ${q}`, margin, y);
            y += 15;
        });

        if (paperType === 'both') { doc.addPage(); y = 20; }
    }

    // ---------------- SUBJECTIVE SECTION ----------------
    if (paperType === 'subjective' || paperType === 'both') {
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('Section B: Subjective Paper (35 marks)', margin, y);
        y += 8;
        doc.setFontSize(11);
        doc.setFont('times', 'normal');
        doc.text('Instructions:', margin, y);
        y += 6;
        doc.text('- Short Questions: Attempt ALL questions. Each carries 2 marks.', margin + 5, y);
        y += 6;
        doc.text('- Long Questions: Attempt ANY 3 questions. Each carries 5 marks.', margin + 5, y);
        y += 10;

        // Short Questions
        let shortQs = [];
        selectedChapters.forEach(ch => shortQs = shortQs.concat(QUESTIONS[subject][ch].short));
        shortQs = shuffleArray(shortQs).slice(0, 10);

        doc.setFont('times', 'bold');
        doc.text('Short Questions (2 marks each)', margin, y);
        y += 8;
        doc.setFont('times', 'normal');
        shortQs.forEach((q, i) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(`${i + 1}. ${q}`, margin, y);
            y += 12;
        });
        y += 5;

        // Long Questions
        let longQs = [];
        selectedChapters.forEach(ch => longQs = longQs.concat(QUESTIONS[subject][ch].long));
        longQs = shuffleArray(longQs).slice(0, 5); // pick 5
        doc.setFont('times', 'bold');
        doc.text('Long Questions (Attempt any 3, 5 marks each)', margin, y);
        y += 8;
        doc.setFont('times', 'normal');
        longQs.forEach((q, i) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(`${i + 1}. ${q}`, margin, y);
            y += 15;
        });
    }

    // Save PDF
    doc.save(`${subject}_QuestionPaper.pdf`);
}

// ---------------- HELPER ----------------
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}
