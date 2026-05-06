import Course from "../models/course.js";

export const checkCourseOwner = (paramName = "courseId") => {
    return async (req, res, next) => {
        try {
            const courseId = req.params[paramName] || req.body[paramName];
            if (!courseId) {
                return res.status(400).json({ msg: "Thiếu courseId" });
            }

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ msg: "Course không tồn tại" });
            }

            if (req.user.role === "admin") return next();

            if (req.user.role === "instructor" && course.createdBy.toString() === req.user.id) {
                return next();
            }

            return res.status(403).json({ msg: "Bạn không có quyền thao tác trên course này" });
        } catch (err) {
            console.error("❌ checkCourseOwner error:", err);
            res.status(500).json({ msg: "Lỗi server" });
        }
    };
};
