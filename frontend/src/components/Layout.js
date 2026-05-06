import React from "react";
import Navbar from "./Navbar";
import FloatingNavbar from "./FloatingNavBar";
import Footer from "./Footer";

function Layout({ children }) {
    return (
    <div style={layoutWrapper}>
    <Navbar />
    
    <main style={mainContent}>{children}</main>
    
    <FloatingNavbar />
    
    <Footer />
    </div>
    );
}

const layoutWrapper = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f8fafc",
    position: "relative",
};

const mainContent = {
    flex: 1,
    padding: "20px 0",
    paddingBottom: "80px",
};

export default Layout;