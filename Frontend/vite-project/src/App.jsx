import { Routes, Route, Navigate } from "react-router";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

import Home from "../pages/HomeDark";
import LoginPage from "../pages/Login";
import SignUpPage from "../pages/Signup";
import CortexLanding from "../pages/CortexLanding";
import LegalPage from "../pages/LegalPage";

function ProtectedRoute({ children }) {
  const isDemo = localStorage.getItem("demoMode") === "true";

  return (
    <>
      {isDemo ? (
        children
      ) : (
        <>
          <SignedIn>{children}</SignedIn>
          <SignedOut>
            <RedirectToSignIn redirectUrl="/home" />
          </SignedOut>
        </>
      )}
    </>
  );
}

function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<CortexLanding />} />

      {/* Protected Home */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      <Route
        path="/privacy-policy"
        element={
          <LegalPage
            title="Privacy Policy"
            intro="How CortexAI collects, stores, and protects user and document-related information."
          />
        }
      />
      <Route
        path="/cookie-declaration"
        element={
          <LegalPage
            title="Cookie Declaration"
            intro="Details about optional cookies, analytics behavior, and user control over browser-side data."
          />
        }
      />
      <Route
        path="/terms"
        element={
          <LegalPage
            title="Terms and Conditions"
            intro="The core usage terms, responsibilities, and expectations for anyone using CortexAI."
          />
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
