import { Routes, Route, Navigate } from "react-router-dom";

//-------------------- Component --------------------//
import Login from "./components/Login";
import NotFound from "./components/NotFound";
import MainPage from "./components/MainPage";

function App() {

  return (
    <div>
      <Routes>
        <Route path="/login">
          <Route path=":error" element={<Login />} />
          <Route path="" element={<Login />} />
        </Route>
        <Route path="/main/*" element={<MainPage />} />
        <Route path="/" exact element={<Navigate to="/login" />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/not-found" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
