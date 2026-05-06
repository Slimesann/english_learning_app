export function compareAlignment(userText, originalScript) {
    if (!userText || !originalScript) {
        return { accuracy: 0, missedWords: [], pronunciationFeedback: "Không có dữ liệu" };
    }

    const originalWords = originalScript.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const spokenWords = userText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);

    let correct = 0;
    const missed = [];

    originalWords.forEach(word => {
        const idx = spokenWords.indexOf(word);
        if (idx !== -1) {
            correct++;
            spokenWords.splice(idx, 1);
        } else {
            missed.push(word);
        }
    });

    const accuracy = originalWords.length > 0 ? Math.round((correct / originalWords.length) * 100) : 0;

    let feedback = "";
    if (accuracy >= 90) feedback = "Phát âm xuất sắc!";
    else if (accuracy >= 70) feedback = "Rất tốt, chỉ cần luyện thêm vài từ.";
    else if (accuracy >= 50) feedback = "Cần luyện lại các từ bị sai.";
    else feedback = "Cần luyện lại toàn bộ câu.";

    return {
        accuracy,
        missedWords: missed.slice(0, 5),
        pronunciationFeedback: feedback
    };
}