import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <aside style={{ width: "200px", background: "#f4f4f4", padding: "15px" }}>
        <h3>Menu</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
            <li><Link to="/courses">📘 Khóa học</Link></li>
            <li><Link to="/dashboard">📊 Dashboard</Link></li>
            <li><Link to="/profile">👤 Profile</Link></li>
            <li><Link to="/admin">⚙️ Admin</Link></li>
        </ul>
        </aside>
    );
}

export default Sidebar;
