"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCityFromIp } from "@/lib/geolocation";

const STORAGE_KEY = "picsellio_home_city";

type HomeLocationContextValue = {
  /** City detected from IP (Turkey only). */
  detectedCity: string | null;
  /** City explicitly chosen by the user; overrides detected when set. */
  userSelectedCity: string | null;
  /** Set user-selected city (persisted in sessionStorage so we don't override). */
  setUserSelectedCity: (city: string | null) => void;
  /** Effective city for filtering: user selection takes precedence over detected. */
  effectiveCity: string | null;
  /** Whether IP geolocation is still loading. */
  isLoadingLocation: boolean;
};

const HomeLocationContext = createContext<HomeLocationContextValue | null>(null);

type HomeLocationProviderProps = {
  children: ReactNode;
};

export function HomeLocationProvider({ children }: HomeLocationProviderProps) {
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [userSelectedCity, setUserSelectedCityState] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const setUserSelectedCity = useCallback((city: string | null) => {
    setUserSelectedCityState(city);
    if (typeof sessionStorage !== "undefined") {
      if (city) sessionStorage.setItem(STORAGE_KEY, city);
      else sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof sessionStorage !== "undefined") {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUserSelectedCityState(stored);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingLocation(true);
    fetch("/data/turkeyLocations.json")
      .then((r) => r.json())
      .then((arr: { city: string }[]) => {
        const names = Array.isArray(arr) ? arr.map((x) => x.city) : [];
        return getCityFromIp(names);
      })
      .then((city) => {
        if (!cancelled) setDetectedCity(city);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingLocation(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveCity = userSelectedCity || detectedCity;

  const value: HomeLocationContextValue = {
    detectedCity,
    userSelectedCity,
    setUserSelectedCity,
    effectiveCity,
    isLoadingLocation,
  };

  return (
    <HomeLocationContext.Provider value={value}>
      {children}
    </HomeLocationContext.Provider>
  );
}

export function useHomeLocation(): HomeLocationContextValue {
  const ctx = useContext(HomeLocationContext);
  if (!ctx) {
    return {
      detectedCity: null,
      userSelectedCity: null,
      setUserSelectedCity: () => {},
      effectiveCity: null,
      isLoadingLocation: false,
    };
  }
  return ctx;
}
