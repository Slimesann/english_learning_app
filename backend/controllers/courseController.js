import Course from "../models/course.js";
import Lesson from "../models/lesson.js";

// Tạo khóa học
export const createCourse = async (req, res) => {
    try {
        const { title, description, level, lessons } = req.body;

        const course = new Course({
            title,
            description,
            level,
            lessons,
            createdBy: req.user._id
        });

        await course.save();
        res.status(201).json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Lỗi khi tạo khóa học" });
    }
};

// Lấy danh sách khóa học
export const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate("createdBy", "name email");
        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Lỗi khi lấy danh sách khóa học" });
    }
};

// Lấy chi tiết khóa học
export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate("createdBy", "name email");
        if (!course) return res.status(404).json({ msg: "Không tìm thấy khóa học" });
        res.json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Lỗi khi lấy chi tiết khóa học" });
    }
};

// Cập nhật khóa học
export const updateCourse = async (req, res) => {
    try {
        const { title, description, level, lessons, isPublished } = req.body;

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { title, description, level, lessons, isPublished },
            { new: true }
        );

        if (!course) return res.status(404).json({ msg: "Không tìm thấy khóa học" });
        res.json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Lỗi khi cập nhật khóa học" });
    }
};

// Xóa khóa học
export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ msg: "Không tìm thấy khóa học" });
        res.json({ msg: "Đã xóa khóa học" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Lỗi khi xóa khóa học" });
    }
};

// Lấy quiz của tất cả lessons trong 1 course
export const getQuizzesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const quizzes = await Lesson.find({ course: courseId, isTest: true });

        if (!quizzes || quizzes.length === 0) {
            return res.status(404).json({ message: "Không có quiz nào trong khóa học này." });
        }

        res.json(quizzes);
    } catch (err) {
        console.error("❌ Lỗi khi lấy quizzes:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Lấy quiz của lesson
export const getQuizByLesson = async (req, res) => {
    try {
        const { courseId, lessonId } = req.params;

        const lesson = await Lesson.findOne({ _id: lessonId, course: courseId, isTest: true });
        if (!lesson) {
            return res.status(404).json({ message: "Không tìm thấy quiz cho lesson này." });
        }

        res.json(lesson.quiz || lesson.exercises || []);
    } catch (err) {
        console.error("❌ Lỗi khi lấy quiz:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};
