import { Routes, Route, Navigate } from "react-router-dom";
import RootRedirect from "./components/RootRedirect";
import QuestionsPage from "./pages/QuestionPage";
import Home from "./pages/Home";
import IntroducePage from "./pages/IntroducePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import LessonPage from "./pages/LessonPage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifySuccess from "./components/VerifySuccess";
import VerifyFail from "./components/VerifyFail";
import Dictionary from "./components/dictionary";
import AdminPanel from "./components/AdminPanel";
import InstructorPanel from "./components/InstructorPanel";
import CreateCourse from "./components/CreateCourse";
import ReadingForm from "./components/lessonForms/ReadingForm";
import ListeningForm from "./components/lessonForms/ListeningForm";
import WritingForm from "./components/lessonForms/WritingForm";
import SpeakingForm from "./components/lessonForms/SpeakingForm";
import CourseDetailForAdmin from "./components/CourseDetailForAdmin";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import SearchPage from "./pages/SearchPage";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<RootRedirect />} />

            <Route path="/introduce" element={<IntroducePage />} />
            <Route path="/gioi-thieu" element={<IntroducePage />} />
            <Route path="/about" element={<IntroducePage />} />
            <Route path="/features" element={<IntroducePage />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/forum" element={<QuestionsPage />} />
            <Route path="/qna" element={<QuestionsPage />} />
            <Route path="/hoi-dap" element={<QuestionsPage />} />

            <Route path="/dictionary" element={<Dictionary />} />
            <Route path="/verify-success" element={<VerifySuccess />} />
            <Route path="/verify-fail" element={<VerifyFail />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route
                path="/instructor"
                element={
                    <ProtectedRoute allowedRoles={["instructor"]}>
                        <InstructorPanel />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={["admin", "instructor"]}>
                        <AdminPanel />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/create-course"
                element={
                    <ProtectedRoute allowedRoles={["admin", "instructor"]}>
                        <CreateCourse />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/course/:courseId/create-lesson"
                element={
                    <ProtectedRoute allowedRoles={["admin", "instructor"]}>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/course/:courseId/details"
                element={
                    <ProtectedRoute allowedRoles={["admin", "instructor"]}>
                        <CourseDetailForAdmin />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/course/:courseId/lesson/:lessonId/reading"
                element={<ProtectedRoute allowedRoles={["admin", "instructor"]}><ReadingForm /></ProtectedRoute>}
            />
            <Route
                path="/course/:courseId/lesson/:lessonId/listening"
                element={<ProtectedRoute allowedRoles={["admin", "instructor"]}><ListeningForm /></ProtectedRoute>}
            />
            <Route
                path="/course/:courseId/lesson/:lessonId/writing"
                element={<ProtectedRoute allowedRoles={["admin", "instructor"]}><WritingForm /></ProtectedRoute>}
            />
            <Route
                path="/course/:courseId/lesson/:lessonId/speaking"
                element={<ProtectedRoute allowedRoles={["admin", "instructor"]}><SpeakingForm /></ProtectedRoute>}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;