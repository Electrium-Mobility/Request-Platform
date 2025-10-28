'use client';

/*Temporary login page - definitely need to fix front end - looks kind of bad*/
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #1e1f29 0%, #2b2d42 40%, #5865F2 100%)",
        color: "#fff",
        fontFamily: "var(--font-jetbrains), monospace",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          padding: "48px 60px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          maxWidth: "420px",
          width: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          src="/logo.png"
          alt="Electrium Mobility Logo"
          width={70}
          height={70}
          style={{
            marginBottom: "0.1rem", 
            display: "block",
            objectFit: "contain",
          }}
        />

        <h1
          style={{
            fontSize: "1.8rem",
            margin: 0, 
            lineHeight: 1.1,
            marginTop: "0.2rem", 
          }}
        >
          Electrium Mobility
        </h1>

        <p
          style={{
            opacity: 0.8,
            marginTop: "1rem",
            marginBottom: "2rem",
            fontSize: "1rem",
          }}
        >
          Task Management Platform
        </p>

        <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.75)" }}>
          Sign in to access internal team boards.
        </p>

        <DiscordLoginButton />
      </div>
    </div>
  );
}

function DiscordLoginButton() {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={() => signIn("discord", { callbackUrl: "/" })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        marginTop: "2rem",
        padding: "0.9rem 1.8rem",
        backgroundColor: hover ? "#4752C4" : "#5865F2",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        fontSize: "1rem",
        cursor: "pointer",
        transition: "background 0.2s ease",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png"
        alt="Discord logo"
        width={22}
        height={22}
        style={{
          filter: "brightness(0) invert(1)",
          display: "block",
        }}
      />
      Sign in with Discord
    </button>
  );
}
