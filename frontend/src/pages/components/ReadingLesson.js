import React from "react";

function ReadingLesson({ lesson }) {
    return (
        <div>
        <h3>📖 Reading</h3>
        <p style={{ whiteSpace: "pre-line" }}>
            {lesson.content || "Không có nội dung bài đọc."}
        </p>
        </div>
    );
}

export default ReadingLesson;
