import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EnglishChatBox from "./EnglishChatBox";
import DictionaryWidget from "./dictionary";
export default function FloatingNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTool, setActiveTool] = useState(null);

    return (
        <>
            {/* NÚT CHÍNH – TRÒN, GÓC DƯỚI PHẢI */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#0084ff",
                    color: "white",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,132,255,0.3)",
                    fontSize: "26px",
                    cursor: "pointer",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                title="English Tools"
            >
                {isOpen ? "×" : "EN"}
            </motion.button>

            {/* THANH NGANG 3 ICON */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: "fixed",
                            bottom: "96px",
                            right: "24px",
                            background: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "24px",
                            padding: "8px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                            zIndex: 999,
                            display: "flex",
                            gap: "4px",
                        }}
                    >
                        {/* CHAT AI */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setActiveTool("chatAI");
                                setIsOpen(false);
                            }}
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                background: "#0084ff",
                                color: "white",
                                border: "none",
                                fontSize: "20px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 2px 8px rgba(0,132,255,0.3)",
                            }}
                            title="Chat AI"
                        >
                            🤖
                        </motion.button>

                        {/* TỪ ĐIỂN */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setActiveTool("dictionary");
                                setIsOpen(false);
                            }}
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                background: "#34c759",
                                color: "white",
                                border: "none",
                                fontSize: "20px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 2px 8px rgba(52,199,89,0.3)",
                            }}
                            title="Tra từ điển"
                        >
                            📖
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MỞ 3 LOẠI CHATBOX */}
            <AnimatePresence>
                {activeTool === "chatAI" && (
                    <EnglishChatBox onClose={() => setActiveTool(null)} />
                )}

                {activeTool === "dictionary" && (
                    <DictionaryWidget onClose={() => setActiveTool(null)} />
                )}
            </AnimatePresence>
        </>
    );
}
