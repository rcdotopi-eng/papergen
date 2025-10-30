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

    // ------------------ Objective Paper ------------------
    if (paperType === 'objective' || paperType === 'both') {
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('Section A: Objective Paper (15 marks)', pageWidth/2, y, {align: 'center'});
        y += 10;

        let mcqs = [];
        selectedChapters.forEach(ch => mcqs = mcqs.concat(QUESTIONS[subject][ch].objective));
        mcqs = shuffleArray(mcqs).slice(0, 10); // exactly 10 mandatory MCQs

        mcqs.forEach((q, i) => {
            if (y > 270) { doc.addPage(); y = 20; }

            // Split long text to fit page width
            const questionLines = doc.splitTextToSize(`${i+1}. ${q}`, pageWidth - 2*margin - 20);
            doc.text(questionLines, margin, y);

            // Draw checkbox squares for 4 options (for clarity)
            const boxStartY = y;
            for (let j = 0; j < 4; j++) {
                doc.rect(pageWidth - margin - 15, boxStartY + j*6, 5, 5);
            }

            y += questionLines.length * 6 + 8; // reduced spacing for compactness
        });

        if(paperType === 'both') doc.addPage(); y = 20;
    }

    // ------------------ Subjective Paper ------------------
    if (paperType === 'subjective' || paperType === 'both') {
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('Section B: Subjective Paper (35 marks)', pageWidth/2, y, {align: 'center'});
        y += 10;

        // Instructions
        doc.setFontSize(11);
        doc.setFont('times', 'normal');
        const instructions = [
            "Instructions:",
            "1. Attempt all short questions.",
            "2. Attempt any 3 long questions."
        ];
        instructions.forEach(line => {
            if(y > 270) { doc.addPage(); y = 20; }
            doc.text(line, margin, y);
            y += 6;
        });
        y += 4;

        // Short Questions
        let shortQs = [];
        selectedChapters.forEach(ch => shortQs = shortQs.concat(QUESTIONS[subject][ch].short));
        shortQs = shuffleArray(shortQs).slice(0, 10); // exactly 10 mandatory short questions

        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('Short Questions (2 marks each)', margin, y);
        y += 6;

        doc.setFont('times', 'normal');
        shortQs.forEach((q, i) => {
            y = addSubjectiveQuestion(doc, i+1, q, pageWidth, margin, y, 6); // reduced line spacing
        });

        y += 4;

        // Long Questions
        let longQs = [];
        selectedChapters.forEach(ch => longQs = longQs.concat(QUESTIONS[subject][ch].long));
        longQs = shuffleArray(longQs).slice(0,5); // 5 questions, attempt 3

        doc.setFont('times', 'bold');
        doc.text('Long Questions (Attempt any 3, 5 marks each)', margin, y);
        y += 6;

        doc.setFont('times', 'normal');
        longQs.forEach((q, i) => {
            y = addSubjectiveQuestion(doc, i+1, q, pageWidth, margin, y, 6); // reduced line spacing
        });
    }

    doc.save(`${subject}_QuestionPaper.pdf`);
}

// ------------------ Helpers ------------------
function shuffleArray(array) {
    return array.sort(() => Math.random()-0.5);
}

function addSubjectiveQuestion(doc, questionNumber, text, pageWidth, margin, y, lineHeight=6) {
    const textWidth = pageWidth - 2*margin;
    const lines = doc.splitTextToSize(`${questionNumber}. ${text}`, textWidth);

    if(y + lines.length * lineHeight + 5 > 280) {
        doc.addPage();
        y = 20;
    }

    doc.text(lines, margin, y, {align: 'left'});
    y += lines.length * lineHeight + 3;
    return y;
}
