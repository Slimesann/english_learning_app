const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "user_avatars");
    formData.append("folder", "avatars");

    const res = await fetch("https://api.cloudinary.com/v1_1/daqtutvru/image/upload", {
        method: "POST",
        body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload thất bại");
    return data.secure_url;
};

export default uploadToCloudinary;