import React from "react";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 16.3 3 9.7 7.6 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29 36 26.6 37 24 37c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 40.4 16.3 45 24 45z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C40.7 36 45 30.4 45 24c0-1.2-.1-2.4-.4-3.5z"/>
  </svg>
);

// Botão "Continuar com Google" — partilhado entre Login e Register.
export const GoogleButton = ({ onClick, label = "Continuar com Google", testid = "login-google" }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-center gap-3 border hairline rounded-full py-3 font-body text-sm hover:bg-[var(--da-cream-2)]"
    data-testid={testid}
  >
    <GoogleIcon /> {label}
  </button>
);
