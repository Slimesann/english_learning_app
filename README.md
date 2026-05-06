English Learning Web Platform (AI-Integrated)
Dự án tốt nghiệp (DATN) - Hệ thống học tiếng Anh toàn diện tích hợp Trí tuệ nhân tạo để hỗ trợ luyện tập 4 kỹ năng (Nghe, Nói, Đọc, Viết). Dự án sử dụng mô hình Faster-Whisper để nhận dạng giọng nói và Google Gemini AI để phân tích, đánh giá kết quả học tập.

 Tính năng nổi bật
Speaking AI: Chuyển đổi giọng nói thành văn bản bằng Whisper AI và đánh giá phát âm thông qua Gemini.

Quản lý khóa học: Hệ thống quản lý bài học, bài tập (Quiz) đa dạng cho Admin/Instructor.

Luyện nghe (Listening): Hỗ trợ upload và xử lý file âm thanh chuyên sâu.

Theo dõi tiến độ: Hệ thống Dashboard ghi lại kết quả (Result) và tiến trình (Progress) của từng người dùng.

Dictionary & AI Chat: Tích hợp bộ từ điển và hộp thoại hỗ trợ học tập thông minh.

 Kiến trúc dự án (Tech Stack)
Frontend
Framework: React.js

Styling: CSS3, Tailwind CSS (hoặc Material UI tùy cấu hình của bạn)

Animations: Lottie (cho các hiệu ứng cờ Anh, loading...)

State Management: Context API (AuthContext)

Backend
Runtime: Node.js & Express.js

Database: MongoDB (Mongoose)

Authentication: JWT (JSON Web Token)

File Handling: Multer (xử lý upload âm thanh/hình ảnh)

AI Service (Speech-to-Text)
Engine: Python 3.11+

Model: Systran/faster-whisper-small.en

Orchestration: Node.js gọi Script Python thông qua child_process hoặc API.

 Hướng dẫn cài đặt & Khởi chạy
1. Yêu cầu hệ thống
Node.js v16+

Python 3.11+

MongoDB Server (Local hoặc Atlas)

2. Thiết lập Backend
Bash
cd backend
npm install
# Tạo file .env dựa trên các biến sau:
# PORT=5000, MONGO_URI, JWT_SECRET, GEMINI_API_KEY
Thiết lập môi trường AI (Python):

Bash
cd backend
# Tạo môi trường ảo (nếu chưa có)
python -m venv whisper_env
.\whisper_env\Scripts\activate
pip install -r requirements.txt
3. Thiết lập Frontend
Bash
cd frontend
npm install
4. Chạy ứng dụng
Dự án có sẵn file batch để khởi động nhanh:

Chạy file: backend/start-all.bat

Hoặc chạy thủ công từng phần:

Backend: cd backend && npm start

Frontend: cd frontend && npm start
