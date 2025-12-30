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
import { useSettingsStore } from "../store/settingsStore";

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
  // Set an overlay background color used for cross-fade during theme switches
  const overlayBg = resolvedTheme === "dark" ? "#0b1220" : "#ffffff";
  root.style.setProperty("--yc-overlay-bg", overlayBg);
  // Focus outer ring for contrast across themes
  const focusOuter = resolvedTheme === "dark" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)";
  root.style.setProperty("--yc-focus-outer", focusOuter);
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.setAttribute("data-theme", resolvedTheme);
}

export function ThemeProvider({
  initialTheme = "light",
  initialAccent = "#4F46E5",
  children,
}) {
  // Resolve initial values preferring settings store, then local keys, then props
  const bootstrapFromStore = () => {
    try {
      const state = useSettingsStore.getState?.();
      if (state && state.theme) return { theme: state.theme, accent: state.accentColor };
    } catch (_) {}
    if (typeof window !== "undefined") {
      try {
        const persisted = localStorage.getItem("settings-store");
        if (persisted) {
          const parsed = JSON.parse(persisted);
          if (parsed?.state?.theme) {
            return { theme: parsed.state.theme, accent: parsed.state.accentColor || initialAccent };
          }
        }
      } catch (_) {}
    }
    const localTheme = typeof window !== "undefined" ? localStorage.getItem("yc_theme") : null;
    const localAccent = typeof window !== "undefined" ? localStorage.getItem("yc_accent") : null;
    return { theme: localTheme || initialTheme, accent: localAccent || initialAccent };
  };

  const boot = bootstrapFromStore();

  const [themeState, setThemeState] = useState(boot.theme);
  const [accentState, setAccentState] = useState(boot.accent);

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
      const resolved = typeof nextTheme === "function" ? nextTheme(prev) : nextTheme;
      applyTheme(resolved, accentRef.current);
      // persist in lightweight keys
      if (typeof window !== "undefined") localStorage.setItem("yc_theme", resolved);
      // also keep settings store in sync if available
      try {
        const { setTheme: setStoreTheme } = useSettingsStore.getState?.() || {};
        setStoreTheme?.(resolved);
      } catch (_) {}
      return resolved;
    });
  }, []);

  const updateAccent = useCallback((nextAccent) => {
    setAccentState((prev) => {
      const resolved = typeof nextAccent === "function" ? nextAccent(prev) : nextAccent;
      applyTheme(themeRef.current, resolved);
      if (typeof window !== "undefined") localStorage.setItem("yc_accent", resolved);
      try {
        const { setAccentColor } = useSettingsStore.getState?.() || {};
        setAccentColor?.(resolved);
      } catch (_) {}
      return resolved;
    });
  }, []);

  useEffect(() => {
    applyTheme(themeState, accentState);
  }, []);

  // Subscribe to settings store changes so theme applies instantly even if set elsewhere
  useEffect(() => {
    let unsubTheme, unsubAccent;
    try {
      const store = useSettingsStore;
      if (store?.subscribe) {
        unsubTheme = store.subscribe((s) => s.theme, (val) => {
          if (val && val !== themeRef.current) {
            themeRef.current = val;
            setThemeState(val);
            applyTheme(val, accentRef.current);
          }
        });
        unsubAccent = store.subscribe((s) => s.accentColor, (val) => {
          if (val && val !== accentRef.current) {
            accentRef.current = val;
            setAccentState(val);
            applyTheme(themeRef.current, val);
          }
        });
      }
    } catch (_) {}
    return () => {
      try {
        unsubTheme?.();
        unsubAccent?.();
      } catch (_) {}
    };
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
