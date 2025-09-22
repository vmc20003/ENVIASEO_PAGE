import React, { useState } from "react";
import LoginPage from "./pages/LoginPage/LoginPage";
import SelectionPage from "./pages/SelectionPage/SelectionPage";
import MainApp from "./pages/MainApp/MainApp";
import AlcaldiaEnvigadoPage from "./pages/AlcaldiaEnvigado/AlcaldiaEnvigadoPage";
import EnviaseoControlAccesoPage from "./pages/EnviaseoControlAcceso/EnviaseoControlAccesoPage";
import "./styles.css";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (success) => {
    if (success) {
      setIsAuthenticated(true);
      setCurrentPage("selection");
    }
  };

  const handleSelectOption = (optionId) => {
    if (optionId === "attendance") {
      setCurrentPage("main");
    } else if (optionId === "alcaldia-envigado") {
      setCurrentPage("alcaldia");
    } else if (optionId === "enviaseo-control-acceso") {
      setCurrentPage("enviaseo-control-acceso");
    } else if (optionId === "settings") {
      // Aquí puedes agregar la lógica para la página de configuración
      alert("Página de configuración en desarrollo");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage("login");
  };

  const handleBackToSelection = () => {
    setCurrentPage("selection");
  };

  // Renderizar la página correspondiente
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "login":
        return <LoginPage onLogin={handleLogin} />;
      case "selection":
        return (
          <SelectionPage
            onSelectOption={handleSelectOption}
            onLogout={handleLogout}
          />
        );
      case "main":
        return <MainApp onBack={handleBackToSelection} />;
      case "alcaldia":
        return <AlcaldiaEnvigadoPage onBack={handleBackToSelection} />;
      case "enviaseo-control-acceso":
        return <EnviaseoControlAccesoPage onBack={handleBackToSelection} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return <div className="App">{renderCurrentPage()}</div>;
}

export default App;
