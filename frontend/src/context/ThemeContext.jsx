import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ThemeValues = {
  theme: "light",
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
  const resolvedTheme =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme;
  root.dataset.theme = resolvedTheme;
  root.style.setProperty("--accent-color", accentColor);
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.setAttribute("data-theme", resolvedTheme);
}

export function ThemeProvider({
  initialTheme = "light",
  initialAccent = "#4F46E5",
  children,
}) {
  const [themeState, setThemeState] = useState(() => {
    if (typeof window === "undefined") return initialTheme;
    const stored = localStorage.getItem("yc_theme");
    const resolved = stored || initialTheme;
    applyTheme(resolved, initialAccent);
    return resolved;
  });

  const [accentState, setAccentState] = useState(() => {
    if (typeof window === "undefined") return initialAccent;
    const stored = localStorage.getItem("yc_accent");
    const resolved = stored || initialAccent;
    return resolved;
  });

  const themeRef = useRef(themeState);
  const accentRef = useRef(accentState);

  useEffect(() => {
    themeRef.current = themeState;
  }, [themeState]);

  useEffect(() => {
    accentRef.current = accentState;
  }, [accentState]);

  const updateTheme = useCallback((nextTheme) => {
    setThemeState((prev) => {
      const resolved =
        typeof nextTheme === "function" ? nextTheme(prev) : nextTheme;
      applyTheme(resolved, accentRef.current);
      if (typeof window !== "undefined") {
        localStorage.setItem("yc_theme", resolved);
      }
      return resolved;
    });
  }, []);

  const updateAccent = useCallback((nextAccent) => {
    setAccentState((prev) => {
      const resolved =
        typeof nextAccent === "function" ? nextAccent(prev) : nextAccent;
      applyTheme(themeRef.current, resolved);
      if (typeof window !== "undefined") {
        localStorage.setItem("yc_accent", resolved);
      }
      return resolved;
    });
  }, []);

  useEffect(() => {
    applyTheme(themeState, accentState);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (themeRef.current === "system") {
        applyTheme("system", accentRef.current);
      }
    };

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const value = useMemo(
    () => ({
      theme: themeState,
      accentColor: accentState,
      setTheme: updateTheme,
      setAccentColor: updateAccent,
    }),
    [themeState, accentState, updateTheme, updateAccent],
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
  initialTheme: "light",
  initialAccent: "#4F46E5",
};

export default ThemeContext;
