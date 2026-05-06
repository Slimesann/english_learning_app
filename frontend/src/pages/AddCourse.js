import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddCourse() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        level: "Beginner",
        lessons: []
    });
    const [lessonTitle, setLessonTitle] = useState("");
    const [lessonContent, setLessonContent] = useState("");
    const navigate = useNavigate();

    const addLesson = () => {
        if (!lessonTitle) return;
        setForm(prev => ({ 
            ...prev, 
            lessons: [...prev.lessons, { title: lessonTitle, content: lessonContent }] 
        }));
        setLessonTitle(""); 
        setLessonContent("");
    };

    const removeLesson = (idx) => {
        setForm(prev => ({ 
            ...prev, 
            lessons: prev.lessons.filter((_,i) => i !== idx) 
        }));
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("accessToken");
            await axios.post("http://localhost:5000/api/courses", form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Đã tạo khóa học!");
            navigate("/courses");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || "Lỗi khi tạo khóa học");
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: "20px auto", background: "white", padding: 20, borderRadius: 8 }}>
            <h2>➕ Thêm khóa học mới</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Tiêu đề</label><br/>
                    <input 
                        name="title" 
                        value={form.title} 
                        onChange={handleChange} 
                        required 
                        style={{width: "100%"}}
                    />
                </div>

                <div style={{ marginTop: 10 }}>
                    <label>Mô tả</label><br/>
                    <textarea 
                        name="description" 
                        value={form.description} 
                        onChange={handleChange} 
                        style={{width: "100%"}} 
                    />
                </div>

                <div style={{ marginTop: 10 }}>
                    <label>Cấp độ</label><br/>
                    <select name="level" value={form.level} onChange={handleChange}>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                    </select>
                </div>

                <hr/>

                <h4>Lessons</h4>
                <div>
                    <input 
                        placeholder="Lesson title" 
                        value={lessonTitle} 
                        onChange={(e)=>setLessonTitle(e.target.value)} 
                    />
                    <input 
                        placeholder="Lesson content" 
                        value={lessonContent} 
                        onChange={(e)=>setLessonContent(e.target.value)} 
                        style={{marginLeft:8}} 
                    />
                    <button type="button" onClick={addLesson} style={{marginLeft:8}}>
                        Add lesson
                    </button>
                </div>

                <ul>
                    {form.lessons.map((ls, idx) => (
                        <li key={idx}>
                            <strong>{ls.title}</strong> — {ls.content}
                            <button 
                                type="button" 
                                onClick={() => removeLesson(idx)} 
                                style={{marginLeft:8}}
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>

                <button type="submit" style={{ marginTop: 12 }}>Tạo khóa học</button>
            </form>
        </div>
    );
}

export default AddCourse;
