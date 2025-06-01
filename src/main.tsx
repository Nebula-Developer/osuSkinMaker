import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { useThemeStore } from "./store/themeStore.ts";
import { cn } from "./lib/utils.ts";

import "./index.css";
import "./custom.css";

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme.theme === "dark");
  }, [theme.theme]);

  return (
    <div
      className={cn(
        "bg-background text-foreground min-h-screen h-0 w-full flex flex-col o",
        theme.theme === "dark" ? "dark" : ""
      )}
    >
      {children}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeWrapper>
      <Toaster />
      <App />
    </ThemeWrapper>
  </StrictMode>
);
