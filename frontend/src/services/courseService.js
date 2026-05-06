import API from "./api";

// Lấy danh sách khóa học công khai

export const getCourses = async () => {
    try {
        const res = await API.get("/courses");
        console.log("getCourses API:", res.data);
        return res.data;
    } catch (err) {
        console.error("Lỗi getCourses:", err.response?.data || err.message);
        throw new Error(err.response?.data?.error || "Không thể tải khóa học");
    }
};

// Lấy chi tiết 1 khóa học theo ID

export const getCourseById = async (id) => {
    if (!id) throw new Error("ID khóa học không hợp lệ");

    const idStr = id.toString();
    if (idStr === '[object Object]' || !idStr.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("ID khóa học không hợp lệ (có thể là object populated, dùng .toString() hoặc _id)");
    }

    try {
        const res = await API.get(`/courses/${idStr}`);
        return res.data;
    } catch (err) {
        console.error(`Lỗi getCourseById(${idStr}):`, err.response?.data || err.message);
        throw new Error(err.response?.data?.error || "Không tìm thấy khóa học");
    }
};

// Tạo khóa học mới

export const createCourse = async (data) => {
    try {
        const res = await API.post("/courses", data);
        return res.data;
    } catch (err) {
        console.error("Lỗi createCourse:", err.response?.data || err.message);
        throw new Error(err.response?.data?.error || "Tạo khóa học thất bại");
    }
};

// Cập nhật khóa học
export const updateCourse = async (id, data) => {
    if (!id) throw new Error("ID khóa học không hợp lệ");

    try {
        const res = await API.put(`/courses/${id}`, data);
        return res.data;
    } catch (err) {
        console.error(`Lỗi updateCourse(${id}):`, err.response?.data || err.message);
        throw new Error(err.response?.data?.error || "Cập nhật thất bại");
    }
};

//  Xóa khóa học
export const deleteCourse = async (id) => {
    if (!id) throw new Error("ID khóa học không hợp lệ");

    try {
        const res = await API.delete(`/courses/${id}`);
        return res.data;
    } catch (err) {
        console.error(`Lỗi deleteCourse(${id}):`, err.response?.data || err.message);
        throw new Error(err.response?.data?.msg || "Xóa thất bại");
    }
};

// Hoàn thành 1 bài học → Cập nhật progress
export const completeLesson = async (courseId, lessonId) => {
    if (!courseId || !lessonId) throw new Error("ID không hợp lệ");

    try {
        const res = await API.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
        console.log("completeLesson API:", res.data);
        return res.data;
    } catch (err) {
        console.error(`Lỗi completeLesson(${courseId}, ${lessonId}):`, err.response?.data || err.message);
        throw new Error(err.response?.data?.error || "Cập nhật thất bại");
    }
};

// Thêm khóa học vào danh sách của user (ENROLL)
export const enrollCourse = async (courseId) => {
    if (!courseId) throw new Error("ID khóa học không hợp lệ");

    try {
        const res = await API.post(`/courses/${courseId}/enroll`);
        console.log("enrollCourse API:", res.data);
        return res.data;
    } catch (err) {
        const responseData = err.response?.data;
        const errorMsg = responseData?.error || responseData?.msg || "Thêm khóa học thất bại";

        if (err.response?.status === 400 && (errorMsg.includes("đã thêm") || errorMsg.includes("already"))) {
            console.log(`enrollCourse(${courseId}): Đã thêm rồi, trả về alreadyEnrolled`);
            return { alreadyEnrolled: true, msg: errorMsg }; // ← GIỮ NGUYÊN CẤU TRÚC
        }

        // CÁC LỖI KHÁC → VẪN LOG + THROW
        console.error(`Lỗi enrollCourse(${courseId}):`, responseData || err.message);
        throw new Error(errorMsg);
    }
};