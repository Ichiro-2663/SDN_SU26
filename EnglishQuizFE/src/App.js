import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Homepage from "./pages/Homepage";
import "./Style/theme.css";
import AdminPage from "./pages/AdminPage";
import ProtectRoute from "./pages/ProtectRoute";
import StudentPage from "./pages/StudentPage";
import TeacherPage from "./pages/TeacherPage";
import { AuthProvider } from "./context/AuthContext";
import { ExamProvider } from "./context/ExamContext";
import { ExamHistoryProvider } from "./context/ExamHistoryContext";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ExamProvider>
          <ExamHistoryProvider>
            <UserProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Homepage />} />

                <Route element={<ProtectRoute />}>
                  <Route path="/student" element={<StudentPage />} />
                  <Route path="/teacher" element={<TeacherPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Route>
              </Routes>
            </UserProvider>
          </ExamHistoryProvider>
        </ExamProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
