import React from "react";
import { Lock } from "lucide-react";
import { nav } from "../components/Sidebar";

export default function PlaceholderPage({ active }) {
  return (
    <main className="placeholder">
      <div className="lockPanel">
        <Lock size={42} />
        <h1>{nav.find((n) => n.key === active)?.label || "Module"}</h1>
        <p>This module shell is ready. Next step is wiring routes, data, and member access rules.</p>
        <button>Connect Module</button>
      </div>
    </main>
  );
}
