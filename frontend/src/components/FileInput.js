import React from "react";

export default function FileInput({ accept, onChange }) {
    const handleFileChange = (e) => {
        if (onChange) onChange(e.target.files[0] || null);
    };

    return (
        <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        />
    );
}
