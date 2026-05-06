import React from "react";
import { Link } from "react-router-dom";
import Lottie from "react-lottie-player";
import britishFlag from "../assets/lottie/British Flag.json";
import listeningImg from "../assets/image/listening.png";
import speakingImg from "../assets/image/speaking.png";
import aiImg from "../assets/image/ai.png";
import progressImg from "../assets/image/progress.png";

function IntroducePage() {
return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
        <div
            style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 0,
            }}
        >
            <Lottie
            loop
            animationData={britishFlag}
            play
            speed={0.3}
            style={{ width: "1800px", height: "1800px", opacity: 0.06 }}
            />
    </div>

    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 10 }}>

            <section style={{ padding: "120px 0 80px", textAlign: "center" }}>
            <h1 style={{ fontSize: "56px", fontWeight: 900, marginBottom: "24px", lineHeight: 1.1 }}>
                Luyện Nghe Nói Tiếng Anh<br />
                <span style={{
                background: "linear-gradient(to right, #059669, #1d4ed8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                }}>
                Chuẩn Giọng Bản Xứ
                </span>
            </h1>

            <p style={{ fontSize: "24px", color: "#374151", marginBottom: "48px", maxWidth: "900px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
                Chỉ <strong style={{ color: "#059669" }}>15 phút mỗi ngày</strong> với công nghệ<br className="hidden md:block" />
                <strong>Shadowing + AI Dictation</strong> – đã giúp hơn{" "}
                <strong style={{ color: "#1d4ed8" }}>250.000+</strong> người Việt nói tiếng Anh tự tin như người bản xứ!
            </p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", marginTop: "40px" }}>
                <Link
                to="/register"
                style={{
                    padding: "16px 48px",
                    background: "linear-gradient(to right, #059669, #1d4ed8)",
                    color: "white",
                    fontSize: "28px",
                    fontWeight: 700,
                    borderRadius: "9999px",
                    textDecoration: "none",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    transition: "all 0.3s",
                }}
                onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                >
                Bắt đầu miễn phí ngay
                </Link>

                <Link
                to="/courses"
                style={{
                    padding: "16px 48px",
                    background: "white",
                    color: "#059669",
                    fontSize: "22px",
                    fontWeight: 700,
                    border: "4px solid #059669",
                    borderRadius: "9999px",
                    textDecoration: "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    transition: "all 0.3s",
                }}
                onMouseEnter={(e) => e.target.style.background = "#ecfdf5"}
                onMouseLeave={(e) => e.target.style.background = "white"}
                >
                Xem bài học mẫu
                </Link>
            </div>
            </section>

            <section style={{ padding: "80px 0" }}>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
                gap: "40px",
                justifyItems: "center",
            }}>
                {[
                { img: listeningImg, title: "Luyện Nghe Sâu Như Người Bản Xứ", stat: "92%", text: "học viên nghe hiểu rõ từng từ chỉ sau 1 tháng" },
                { img: speakingImg, title: "Nói Trôi Chảy & Tự Nhiên", stat: "95%", text: "học viên tự tin nói sau 3 tháng với Shadowing chuẩn giọng Anh-Mỹ" },
                { img: aiImg, title: "AI Phản Hồi Tức Thì 24/7", text: "Phát hiện lỗi phát âm, ngữ điệu và gợi ý sửa chi tiết như giáo viên bản xứ" },
                { img: progressImg, title: "Tiến Bộ Cá Nhân Hóa", text: "Đánh giá chuẩn CEFR, lộ trình tự động điều chỉnh theo bạn" },
                ].map((item, i) => (
                <div
                    key={i}
                    style={{
                    background: "white",
                    borderRadius: "24px",
                    overflow: "hidden",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    transition: "all 0.4s",
                    maxWidth: "600px",
                    width: "100%",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-16px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                    <img src={item.img} alt={item.title} style={{ width: "100%", height: "320px", objectFit: "cover" }} />
                    <div style={{ padding: "40px", textAlign: "center" }}>
                    <h3 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "16px", color: "#1f2937" }}>
                        {item.title}
                    </h3>
                    <p style={{ fontSize: "18px", color: "#4b5563", lineHeight: 1.6 }}>
                        {item.stat && <span style={{ color: "#059669", fontWeight: 900, fontSize: "32px" }}>{item.stat} </span>}
                        {item.text}
                    </p>
                    </div>
                </div>
                ))}
            </div>
            </section>

            <section style={{ padding: "96px 0", background: "linear-gradient(to right, #059669, #1d4ed8)", color: "white", textAlign: "center" }}>
            <p style={{ fontSize: "48px", fontWeight: 900, marginBottom: "24px", lineHeight: 1.2 }}>
                “Chỉ 2 tuần đã nghe được phim không cần sub!”
            </p>
            <p style={{ fontSize: "28px", opacity: 0.9 }}>
                — Nguyễn Minh Anh, từ IELTS 4.0 → Speaking 7.5
            </p>
            </section>

            <section style={{ padding: "120px 0", background: "#f9fafb", textAlign: "center" }}>
            <h2 style={{ fontSize: "52px", fontWeight: 900, marginBottom: "80px" }}>
                Chỉ <span style={{ color: "#059669" }}>4 Bước</span> Để Thành Thạo Nghe-Nói
            </h2>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "48px",
                maxWidth: "1200px",
                margin: "0 auto",
            }}>
                {["Chọn chủ đề yêu thích", "Nghe & Chép chính tả", "Nhại theo bản xứ (Shadowing)", "Nhận phản hồi + theo dõi"].map((step, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                    width: "128px",
                    height: "128px",
                    background: "linear-gradient(to right, #059669, #1d4ed8)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "64px",
                    fontWeight: 900,
                    color: "white",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    marginBottom: "32px",
                    }}>
                    {i + 1}
                    </div>
                    <p style={{ fontSize: "24px", fontWeight: 700, maxWidth: "280px" }}>{step}</p>
                </div>
                ))}
            </div>
            </section>

            <section style={{ padding: "128px 0", textAlign: "center", background: "linear-gradient(to top, #064e3b, #1e3a8a)", color: "white" }}>
            <h2 style={{ fontSize: "64px", fontWeight: 900, marginBottom: "48px" }}>
                Sẵn sàng nói tiếng Anh như người bản xứ chưa?
            </h2>
            <Link
                to="/register"
                style={{
                display: "inline-block",
                padding: "24px 80px",
                background: "white",
                color: "#059669",
                fontSize: "48px",
                fontWeight: 900,
                borderRadius: "9999px",
                textDecoration: "none",
                boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
                animation: "pulse 2s infinite",
                }}
            >
                ĐĂNG KÝ MIỄN PHÍ NGAY!
            </Link>
            <p style={{ marginTop: "32px", fontSize: "28px", opacity: 0.9 }}>
                Hoàn tiền 100% nếu không hiệu quả • 250.000+ học viên đã thành công
            </p>
            </section>
        </div>
        </div>
    );
}

export default IntroducePage;