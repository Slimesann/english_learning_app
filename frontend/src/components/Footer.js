import React from "react";
import { Link } from "react-router-dom";
import {
    Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter
} from "lucide-react";

function Footer() {
    return (
        <footer style={footerStyle}>
        <div style={footerContainerStyle}>
            {/* CỘT 1: LIÊN HỆ */}
            <div style={footerColumnStyle}>
            <h3 style={footerTitleStyle}>Liên hệ</h3>
            <div style={footerLinkStyle}>
                <Mail size={16} style={{ marginRight: "8px", color: "#94a3b8" }} />
                <a href="mailto:support@enapp.com" style={footerLinkTextStyle}>
                support@enapp.com
                </a>
            </div>
            <div style={footerLinkStyle}>
                <Phone size={16} style={{ marginRight: "8px", color: "#94a3b8" }} />
                <span style={footerLinkTextStyle}>+84 123 456 789</span>
            </div>
            <div style={footerLinkStyle}>
                <MapPin size={16} style={{ marginRight: "8px", color: "#94a3b8" }} />
                <span style={footerLinkTextStyle}>Hà Nội, Việt Nam</span>
            </div>
            </div>

            {/* CỘT 2: VỀ CHÚNG TÔI */}
            <div style={footerColumnStyle}>
            <h3 style={footerTitleStyle}>Về ENApp</h3>
            <Link to="/about" style={footerLinkTextStyle}>Giới thiệu</Link>
            <Link to="/privacy" style={footerLinkTextStyle}>Chính sách bảo mật</Link>
            <Link to="/terms" style={footerLinkTextStyle}>Điều khoản sử dụng</Link>
            <Link to="/careers" style={footerLinkTextStyle}>Tuyển dụng</Link>
            </div>

            {/* CỘT 3: THEO DÕI */}
            <div style={footerColumnStyle}>
            <h3 style={footerTitleStyle}>Theo dõi</h3>
            <div style={socialLinksStyle}>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={socialIconStyle}>
                <Facebook size={18} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={socialIconStyle}>
                <Instagram size={18} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={socialIconStyle}>
                <Youtube size={18} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={socialIconStyle}>
                <Twitter size={18} />
                </a>
            </div>
            <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "16px" }}>
                © 2025 ENApp. Tất cả quyền được bảo lưu.
            </p>
            </div>
        </div>
        </footer>
    );
}

const footerStyle = {
    background: "#0f172a",
    color: "#cbd5e1",
    padding: "60px 0 30px",
    borderTop: "1px solid #334155",
    fontSize: "14px",
    marginTop: "auto",
};

const footerContainerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 16px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "40px",
};

const footerColumnStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
};

const footerTitleStyle = {
    fontSize: "18px",
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 12px",
};

const footerLinkStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
};

const footerLinkTextStyle = {
    color: "#94a3b8",
    textDecoration: "none",
    transition: "color 0.2s",
    fontSize: "14px",
};

const socialLinksStyle = {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
};

const socialIconStyle = {
    color: "#94a3b8",
    transition: "color 0.2s",
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
    .footer-link-text:hover, .social-icon:hover { 
        color: #3b82f6 !important; 
    }
`;
document.head.appendChild(styleSheet);

export default Footer;