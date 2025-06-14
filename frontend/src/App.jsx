import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthToggle from "./components/AuthToggle";
import TaskManager from "./components/TaskManager";
import { Toaster } from "react-hot-toast";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthToggle />} />
        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <TaskManager />
            </PrivateRoute>
          }
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
