"use client";

import { createContext, useContext, useState } from "react";

type UserSettings = {
  displayPrice: boolean;
  setDisplayPrice: (value: boolean) => void;
};

const UserSettingsContext = createContext<UserSettings>({
  displayPrice: true,
  setDisplayPrice: () => {},
});

export function UserSettingsProvider({ children }: React.PropsWithChildren) {
  const [displayPrice, setDisplayPrice] = useState(true);

  return (
    <UserSettingsContext.Provider value={{ displayPrice, setDisplayPrice }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings(): UserSettings {
  return useContext(UserSettingsContext);
}
