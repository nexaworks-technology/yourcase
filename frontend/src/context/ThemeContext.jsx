import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeValues = {
  theme: "system",
  accentColor: "#4F46E5",
  setTheme: () => {},
  setAccentColor: () => {},
};
const ThemeContext = createContext(ThemeValues);

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme(theme, accentColor) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const nextTheme =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme;
  root.dataset.theme = nextTheme;
  root.style.setProperty("--accent-color", accentColor);
  root.classList.toggle("dark", nextTheme === "dark");
  root.setAttribute("data-theme", nextTheme);
}

export function ThemeProvider({
  initialTheme = "system",
  initialAccent = "#4F46E5",
  children,
}) {
  if (typeof window === "undefined") {
    return (
      <ThemeContext.Provider value={ThemeValues}>
        {children}
      </ThemeContext.Provider>
    );
  }
  const [theme, setTheme] = useState(
    () => localStorage.getItem("yc_theme") || initialTheme,
  );
  const [accentColor, setAccentColor] = useState(
    () => localStorage.getItem("yc_accent") || initialAccent,
  );

  useEffect(() => {
    applyTheme(theme, accentColor);
    localStorage.setItem("yc_theme", theme);
    localStorage.setItem("yc_accent", accentColor);
  }, [theme, accentColor]);

  useEffect(() => {
    const handler = (event) => {
      if (theme === "system") {
        applyTheme(event.matches ? "dark" : "light", accentColor);
      }
    };
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme, accentColor]);

  const value = useMemo(
    () => ({ theme, accentColor, setTheme, setAccentColor }),
    [theme, accentColor],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  initialTheme: PropTypes.string,
  initialAccent: PropTypes.string,
  children: PropTypes.node.isRequired,
};

ThemeProvider.defaultProps = {
  initialTheme: "system",
  initialAccent: "#4F46E5",
};

export default ThemeContext;
