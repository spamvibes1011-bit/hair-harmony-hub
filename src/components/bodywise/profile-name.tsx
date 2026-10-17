import { createContext, useContext } from "react";

export const ProfileNameContext = createContext("");
export const useProfileName = () => useContext(ProfileNameContext);