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

    // Header
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.text('Sardar Shah Mohammad Khan Late Government Boys High School, Ghel Topi', pageWidth/2, y, {align: 'center'});
    y += 10;
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.text(`Name: _____________________     Roll No: _______     Date: __________`, margin, y);
    y += 15;

    // ===== Objective Paper =====
    if (paperType === 'objective' || paperType === 'both') {
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('Objective Paper (15 marks)', pageWidth/2, y, {align: 'center'});
        y += 10;

        // Gather MCQs from selected chapters
        let mcqs = [];
        selectedChapters.forEach(ch => {
            mcqs = mcqs.concat(QUESTIONS[subject][ch].objective || []);
        });

        // Take 10 mandatory MCQs
        mcqs = shuffleArray(mcqs).slice(0, 10);

        doc.setFont('times', 'normal');
        mcqs.forEach((q, i) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(`${i+1}. ${q}`, margin, y, {maxWidth: pageWidth - 2*margin});
            y += 12;
        });

        if (paperType === 'both') { doc.addPage(); y = 20; }
    }

    // ===== Subjective Paper =====
    if (paperType === 'subjective' || paperType === 'both') {
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('Subjective Paper (35 marks)', pageWidth/2, y, {align: 'center'});
        y += 10;

        // --- Short Questions ---
        let shortQs = [];
        selectedChapters.forEach(ch => shortQs = shortQs.concat(QUESTIONS[subject][ch].short || []));
        shortQs = shuffleArray(shortQs).slice(0, 10);  // All 10 mandatory

        doc.setFontSize(12);
        doc.setFont('times', 'normal');
        doc.text('Short Questions (2 marks each)', margin, y);
        y += 8;
        shortQs.forEach((q,i) => {
            if(y > 270){ doc.addPage(); y = 20; }
            doc.text(`${i+1}. ${q}`, margin, y, {maxWidth: pageWidth - 2*margin});
            y += 12;
        });
        y += 5;

        // --- Long Questions ---
        let longQs = [];
        selectedChapters.forEach(ch => longQs = longQs.concat(QUESTIONS[subject][ch].long || []));

        // Choose 5 questions, students attempt 3
        longQs = shuffleArray(longQs).slice(0,5);

        doc.text('Long Questions (Attempt any 3, 5 marks each)', margin, y);
        y += 8;
        longQs.forEach((q,i) => {
            if(y > 270){ doc.addPage(); y = 20; }
            doc.text(`${i+1}. ${q}`, margin, y, {maxWidth: pageWidth - 2*margin});
            y += 15;
        });
    }

    // Save PDF
    doc.save(`${subject}_QuestionPaper.pdf`);
}

function shuffleArray(array) {
    return array.sort(() => Math.random()-0.5);
}
