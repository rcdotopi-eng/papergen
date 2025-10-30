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

// Utility to shuffle arrays
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Function to add MCQs with boxes
function addMCQ(doc, questionNumber, text, pageWidth, margin, y) {
    const lineHeight = 7;
    const lines = doc.splitTextToSize(text, pageWidth - 2*margin - 10);

    // Check page overflow
    if (y + lines.length*lineHeight + 20 > 280) {
        doc.addPage();
        y = 20;
    }

    // Draw question
    doc.setFont('times', 'normal');
    doc.text(`${questionNumber}. ${lines[0]}`, margin, y);
    y += lineHeight;

    // Draw options with boxes
    for (let i = 1; i < lines.length; i++) {
        if (y + lineHeight > 280) { doc.addPage(); y = 20; }
        doc.rect(margin, y-5, 5, 5);       // box
        doc.text(lines[i], margin + 8, y);
        y += lineHeight;
    }

    y += 5; // spacing after question
    return y;
}

// Function to add Subjective questions
function addSubjectiveQuestion(doc, questionNumber, text, pageWidth, margin, y, lineHeight=8) {
    const lines = doc.splitTextToSize(text, pageWidth - 2*margin);
    if (y + lines.length*lineHeight + 10 > 280) {
        doc.addPage();
        y = 20;
    }
    doc.setFont('times', 'normal');
    doc.text(`${questionNumber}. ${lines.join("\n")}`, margin, y);
    y += lines.length*lineHeight + 5;
    return y;
}

// Main Paper Generator
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

    // Objective Paper
    if (paperType === 'objective' || paperType === 'both') {
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('Section A: Objective Paper (15 marks)', pageWidth/2, y, {align: 'center'});
        y += 8;

        // Instructions
        doc.setFontSize(11);
        doc.setFont('times', 'normal');
        doc.text([
            "Instructions:",
            "1. Attempt all 10 multiple choice questions.",
            "2. Fill the box for your selected answer."
        ], margin, y);
        y += 20;

        // Collect MCQs
        let mcqs = [];
        selectedChapters.forEach(ch => mcqs = mcqs.concat(QUESTIONS[subject][ch].objective));
        mcqs = shuffleArray(mcqs).slice(0, 10);

        mcqs.forEach((q, i) => {
            y = addMCQ(doc, i+1, q, pageWidth, margin, y);
        });

        // Add page break before Subjective
        if(paperType === 'both') { doc.addPage(); y = 20; }
    }

    // Subjective Paper
    if (paperType === 'subjective' || paperType === 'both') {
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('Section B: Subjective Paper (35 marks)', pageWidth/2, y, {align: 'center'});
        y += 8;

        // Instructions
        doc.setFontSize(11);
        doc.setFont('times', 'normal');
        doc.text([
            "Instructions:",
            "1. Answer all short questions.",
            "2. Attempt any 3 long questions.",
            "3. Do not write answers in this question paper (for printing purposes)."
        ], margin, y);
        y += 20;

        // Short Questions
        let shortQs = [];
        selectedChapters.forEach(ch => shortQs = shortQs.concat(QUESTIONS[subject][ch].short));
        shortQs = shuffleArray(shortQs).slice(0, 10);

        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('Short Questions (2 marks each)', margin, y);
        y += 8;
        doc.setFont('times', 'normal');

        shortQs.forEach((q,i) => {
            y = addSubjectiveQuestion(doc, i+1, q, pageWidth, margin, y);
        });

        y += 5;

        // Long Questions
        let longQs = [];
        selectedChapters.forEach(ch => longQs = longQs.concat(QUESTIONS[subject][ch].long));
        longQs = shuffleArray(longQs).slice(0,5);

        doc.setFont('times', 'bold');
        doc.text('Long Questions (Attempt any 3, 5 marks each)', margin, y);
        y += 8;
        doc.setFont('times', 'normal');

        longQs.forEach((q,i) => {
            y = addSubjectiveQuestion(doc, i+1, q, pageWidth, margin, y);
        });
    }

    doc.save(`${subject}_QuestionPaper.pdf`);
}
