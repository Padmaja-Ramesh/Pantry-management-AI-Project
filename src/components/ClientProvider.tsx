"use client";

import { FirebaseAppProvider } from "reactfire";
import { ReactNode } from "react";
import {firebaseConfig} from '../firebase';

export default function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      {children}
    </FirebaseAppProvider>
  );
}
