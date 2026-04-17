import { createContext, useContext, useState } from "react";

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [installed, setInstalled] = useState(["citation-wizard", "socratic-math"]);
  const [role, setRole] = useState(null);

  const toggleInstall = (id) =>
    setInstalled((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <AppStateContext.Provider value={{ installed, toggleInstall, role, setRole }}>
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext);
