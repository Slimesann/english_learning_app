export async function chatWithAI(messages) {
    try {
        const res = await fetch("/api/gemini/chat", {  // ĐÚNG ĐƯỜNG DẪN!!!
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        return data.reply || "AI không trả lời được...";
    } catch (err) {
        console.error("Lỗi gọi Gemini:", err);
        throw err;
    }
}