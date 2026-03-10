import React from "react";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";
import "./styles/globals.css";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
