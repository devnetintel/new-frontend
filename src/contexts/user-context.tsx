"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";

interface UserContextType {
  user: ReturnType<typeof useUser>["user"];
  requesterHasLinkedIn: boolean;
  setRequesterHasLinkedIn: (value: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [requesterHasLinkedIn, setRequesterHasLinkedIn] =
    useState<boolean>(false);

  return (
    <UserContext.Provider
      value={{ user, requesterHasLinkedIn, setRequesterHasLinkedIn }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
