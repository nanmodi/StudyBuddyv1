import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ClerkProvider } from "@clerk/clerk-react";

const root = ReactDOM.createRoot(document.getElementById("root"));

console.log(
  "Clerk Publishable Key:",
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
);

// SaaS-inspired Clerk appearance configuration with adjusted secondary text
const clerkAppearance = {
  variables: {
    colorPrimary: "#1e40af", // Deep blue for primary elements
    colorText: "#e5e7eb", // Lighter gray for main text
    colorTextSecondary: "#7c94d6", // Darker, more readable secondary text
    colorBackground: "#1a222f", // Lighter dark blue-gray background
    colorInputBackground: "#2a344a", // Adjusted input background
    colorInputText: "#e5e7eb", // Lighter gray for input text
    colorNeutral: "#4b5b6f", // Subtle gray for borders
    fontFamily: '"Inter", sans-serif', // Consistent with your index.css
    borderRadius: "12px", // Matches your 8px-12px rounded aesthetic
    fontSize: "18px", // Slightly larger for modern readability
    fontWeightNormal: 400,
    fontWeightBold: 600,
    spacingUnit: "16px", // Consistent spacing
  },
  elements: {
    // Root container
    rootBox:
      "box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); border-radius: 16px; padding: 32px; background-color: #1a222f; border: 1px solid #2a344a; backdrop-filter: blur(4px);",
    // Card styling
    card: "border-radius: 16px; background-color: #1a222f; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); border: 1px solid #2a344a;",
    // Inputs
    formFieldInput:
      "background-color: #2a344a; border: 1px solid #4b5b6f; color: #e5e7eb; border-radius: 8px; padding: 12px; transition: all 0.2s ease; outline: none;",
    formFieldInputFocus:
      "box-shadow: 0 0 0 2px #60a5fa; border-color: #60a5fa;", // Softer blue focus ring
    formFieldLabel:
      "color: #e5e7eb; font-weight: 500; font-size: 16px; margin-bottom: 8px;",
    // Buttons
    formButtonPrimary:
      "background: linear-gradient(to right, #1e40af, #3b82f6); color: #ffffff; font-weight: 600; border-radius: 8px; padding: 14px 24px; border: none; transition: background 0.3s ease, transform 0.2s ease; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);",
    formButtonPrimaryHover:
      "background: linear-gradient(to right, #1e3a8a, #2563eb); transform: scale(1.05);",
    // UserButton and Dropdown
    userButtonBox:
      "border-radius: 50%; border: 2px solid #1e40af; padding: 4px; transition: all 0.2s ease;",
    userButtonPopoverCard:
      "background-color: #1a222f; border-radius: 16px; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); border: 1px solid #2a344a; backdrop-filter: blur(4px); padding: 16px;",
    userButtonPopoverActionButton:
      "color: #e5e7eb; padding: 12px 16px; border-radius: 8px; transition: background-color 0.2s ease; font-size: 16px;",
    userButtonPopoverActionButtonHover: "background-color: #2a344a;",
    userButtonPopoverFooter: "display: none;",
    // Avatar
    avatarBox:
      "border-radius: 50%; border: 2px solid #1e40af; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); transition: all 0.2s ease;",
    avatarImage: "transition: filter 0.2s ease;",
    avatarImageHover: "filter: brightness(1.1);",
    // Misc
    headerTitle:
      "color: #ffffff; font-weight: 600; font-size: 24px; margin-bottom: 8px;",
    headerSubtitle: "color: #a3bffa; font-size: 14px; margin-bottom: 16px;",
    footer: "display: none;", // Hide Clerk branding
    socialButtons:
      "background-color: #2a344a; border: 1px solid #4b5b6f; color: #a3bffa; border-radius: 8px; padding: 12px; transition: background-color 0.2s ease;",
    socialButtonsHover: "background-color: #3a4662;",
  },
};

root.render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      appearance={clerkAppearance}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
