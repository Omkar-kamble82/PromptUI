
import { onboardUser } from "@/modules/auth/auth.actions";
import React from "react";

const RootLayout = async({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
      <div>
        {children}
      </div>
  );
};

export default RootLayout;
