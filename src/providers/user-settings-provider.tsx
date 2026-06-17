"use client";

import { createContext, useContext } from "react";

type UserSettings = {
  displayPrice: boolean;
};

const UserSettingsContext = createContext<UserSettings>({ displayPrice: true });

export function UserSettingsProvider({
  children,
  displayPrice,
}: React.PropsWithChildren<{ displayPrice: boolean }>) {
  return (
    <UserSettingsContext.Provider value={{ displayPrice }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings(): UserSettings {
  return useContext(UserSettingsContext);
}
