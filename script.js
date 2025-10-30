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
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.text('Sardar Shah Mohammad Khan Late Government Boys High School, Ghel Topi', pageWidth/2, y, {align: 'center'});
    y += 10;
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.text(`Class: 9th   Subject: Computer   Name: _____________________   Roll No: _______   Date: __________`, margin, y);
    y += 12;
    doc.text(`Total Marks: 50   Time: 2 Hours`, margin, y);
    y += 12;

    // Instructions
    doc.setFontSize(11);
    doc.setFont('times', 'normal');
    const instructions = [
        "Instructions:",
        "1. Read all questions carefully.",
        "2. Attempt all Objective (MCQs) and Short Questions.",
        "3. Attempt only required Long Questions as indicated.",
        "4. Write answers neatly in the space provided.",
        "5. Marks are indicated for each section."
    ];
    instructions.forEach(line => { doc.text(line, margin, y); y += 6; });
    y += 4;

    // ---------------- Objective Paper ----------------
    if (paperType === 'objective' || paperType === 'both') {
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('Section A: Objective Paper (15 marks)', margin, y);
        y += 8;

        let mcqs = [];
        selectedChapters.forEach(ch => mcqs = mcqs.concat(QUESTIONS[subject][ch].objective));
        mcqs = shuffleArray(mcqs).slice(0, 10);

        doc.setFontSize(12);
        doc.setFont('times', 'normal');
        mcqs.forEach((q, i) => {
            if (y > pageHeight - 40) { doc.addPage(); y = margin; }
            // Question number and text
            doc.text(`${i+1}. ${q.split('\n')[0]}`, margin, y);
            y += 6;
            // Options with boxes
            const options = q.split('\n').slice(1);
            options.forEach(opt => {
                if (y > pageHeight - 40) { doc.addPage(); y = margin; }
                doc.rect(margin, y-4, 5, 5); // checkbox
                doc.text(opt.replace(/^\(.\)/,''), margin+8, y);
                y += 6;
            });
            y += 4;
        });
        y += 10;

        if(paperType === 'both') { doc.addPage(); y = margin; }
    }

    // ---------------- Subjective Paper ----------------
    if (paperType === 'subjective' || paperType === 'both') {
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('Section B: Subjective Paper (35 marks)', margin, y);
        y += 8;

        // Short Questions
        let shortQs = [];
        selectedChapters.forEach(ch => shortQs = shortQs.concat(QUESTIONS[subject][ch].short));
        shortQs = shuffleArray(shortQs).slice(0, 10);

        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('Short Questions (2 marks each)', margin, y);
        y += 6;
        doc.setFont('times', 'normal');
        shortQs.forEach((q, i) => {
            if (y > pageHeight - 50) { doc.addPage(); y = margin; }
            doc.text(`${i+1}. ${q}`, margin, y);
            y += 6;
            // space for answer
            for(let j=0;j<3;j++){ y += 6; doc.line(margin, y, pageWidth-margin, y); }
            y += 4;
        });

        y += 6;

        // Long Questions
        let longQs = [];
        selectedChapters.forEach(ch => longQs = longQs.concat(QUESTIONS[subject][ch].long));
        longQs = shuffleArray(longQs).slice(0, 5); // pick 5
        doc.setFont('times', 'bold');
        doc.text('Long Questions (Attempt any 3, 5 marks each)', margin, y);
        y += 6;
        doc.setFont('times', 'normal');
        longQs.forEach((q, i) => {
            if (y > pageHeight - 70) { doc.addPage(); y = margin; }
            doc.text(`${i+1}. ${q}`, margin, y);
            y += 6;
            // space for answer
            for(let j=0;j<8;j++){ y += 6; doc.line(margin, y, pageWidth-margin, y); }
            y += 6;
        });
    }

    // Footer (page numbers)
    const pageCount = doc.getNumberOfPages();
    for (let i=1; i<=pageCount; i++){
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth-30, pageHeight-10);
    }

    doc.save(`${subject}_QuestionPaper.pdf`);
}

// Utility function to shuffle array
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}
