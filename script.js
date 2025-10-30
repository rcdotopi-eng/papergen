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

// Helper function to shuffle arrays
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Function to add subjective questions with proper margins
function addSubjectiveQuestion(doc, questionNumber, text, pageWidth, margin, y, lineHeight=8) {
    const textWidth = pageWidth - 2 * margin;  // left and right margins
    const lines = doc.splitTextToSize(text, textWidth);

    if (y + lines.length * lineHeight + 10 > 280) {  // page overflow check
        doc.addPage();
        y = 20;
    }

    doc.setFont('times', 'normal');
    doc.text(lines, margin, y, { align: 'left' });
    y += lines.length * lineHeight + 5;
    return y;
}

function generatePaper(subject, selectedChapters, paperType) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // HEADER
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.text('Sardar Shah Mohammad Khan Late Government Boys High School, Ghel Topi', pageWidth/2, y, {align: 'center'});
    y += 10;
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.text(`Name: _____________________     Roll No: _______     Date: __________`, margin, y);
    y += 15;

    // === OBJECTIVE PAPER ===
    if (paperType === 'objective' || paperType === 'both') {
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('Section A: Objective Paper (15 marks)', pageWidth/2, y, {align: 'center'});
        y += 10;
        doc.setFontSize(12);
        doc.setFont('times', 'normal');
        doc.text('Instructions: Attempt all questions. Fill the box for correct answer.', margin, y);
        y += 8;

        let mcqs = [];
        selectedChapters.forEach(ch => mcqs = mcqs.concat(QUESTIONS[subject][ch].objective));
        mcqs = shuffleArray(mcqs).slice(0, 10);

        mcqs.forEach((q, i) => {
            if (y > 270) { doc.addPage(); y = 20; }
            const questionLines = doc.splitTextToSize(`${i+1}. ${q}`, pageWidth - 2 * margin - 20);
            doc.text(questionLines, margin, y);

            // Draw checkbox squares for answers
            const boxY = y;
            for (let j=0; j<4; j++) {
                doc.rect(pageWidth - margin - 15, boxY + j*6, 5, 5);
            }

            y += questionLines.length * 7 + 10;
        });

        if (paperType === 'both') doc.addPage(); y = 20;
    }

    // === SUBJECTIVE PAPER ===
    if (paperType === 'subjective' || paperType === 'both') {
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('Section B: Subjective Paper (35 marks)', pageWidth/2, y, {align: 'center'});
        y += 10;

        // Instructions
        doc.setFontSize(12);
        doc.setFont('times', 'normal');
        doc.text('Instructions:', margin, y);
        y += 6;
        const instructions = [
            '1. Attempt all short questions (2 marks each).',
            '2. Attempt any 3 long questions (5 marks each).',
            '3. Write answers clearly and neatly.'
        ];
        instructions.forEach(ins => {
            const insLines = doc.splitTextToSize(ins, pageWidth - 2*margin);
            doc.text(insLines, margin, y);
            y += insLines.length * 6 + 2;
        });
        y += 4;

        // Short Questions
        let shortQs = [];
        selectedChapters.forEach(ch => shortQs = shortQs.concat(QUESTIONS[subject][ch].short));
        shortQs = shuffleArray(shortQs).slice(0, 10);

        doc.setFont('times', 'bold');
        doc.text('Short Questions (2 marks each)', margin, y);
        y += 8;
        doc.setFont('times', 'normal');
        shortQs.forEach((q,i) => { y = addSubjectiveQuestion(doc, i+1, `${i+1}. ${q}`, pageWidth, margin, y); });

        y += 5;

        // Long Questions
        let longQs = [];
        selectedChapters.forEach(ch => longQs = longQs.concat(QUESTIONS[subject][ch].long));
        longQs = shuffleArray(longQs).slice(0, 5);

        doc.setFont('times', 'bold');
        doc.text('Long Questions (Attempt any 3, 5 marks each)', margin, y);
        y += 8;
        doc.setFont('times', 'normal');
        longQs.forEach((q,i) => { y = addSubjectiveQuestion(doc, i+1, `${i+1}. ${q}`, pageWidth, margin, y); });
    }

    doc.save(`${subject}_QuestionPaper.pdf`);
}
