import React from "react";

function ListeningLesson({ lesson }) {
    const audioSrc = lesson.mediaUrl || lesson.audioFile;

    return (
        <div>
            <h3>🎧 Listening</h3>
            {audioSrc ? (
                <audio controls src={`http://localhost:5000${audioSrc}`} style={{ width: "100%" }}>
                    Trình duyệt không hỗ trợ audio.
                </audio>
            ) : (
                <p>❌ Không có audio</p>
            )}
            {lesson.content && (
                <div
                    style={{
                        background: "#f9f9f9",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        marginTop: 10,
                    }}
                >
                    <b>Transcript:</b>
                    <p>{lesson.content}</p>
                </div>
            )}
        </div>
    );
}

export default ListeningLesson;