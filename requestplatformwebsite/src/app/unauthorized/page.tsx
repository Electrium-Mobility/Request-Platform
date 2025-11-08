'use client';

import Link from "next/link";

/* Page for users not in the Discord server, front end ugly as well should probably fix 
maybe include link to discord server later (maybe also only allow certain roles to access website)*/
export default function UnauthorizedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #2b2d42 0%, #1e1f29 40%, #ef233c 100%)",
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
        }}
      >
        <img
          src="/logo.png"
          alt="Electrium Mobility Logo"
          width={70}
          height={70}
          style={{
            marginBottom: "0.5rem",
            display: "block",
            objectFit: "contain",
            marginInline: "auto",
          }}
        />

        <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
          Access Denied
        </h1>

        <p style={{ opacity: 0.8, marginBottom: "2rem" }}>
          You must be a verified member of the Electrium Mobility Discord server
          to access this platform.
        </p>

        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.9rem",
            opacity: 0.8,
          }}
        >
          If you believe this is a mistake, please contact an administrator or{" "}
          <Link
            href="/login"
            style={{
              color: "#fff",
              textDecoration: "underline",
              fontWeight: 500,
            }}
          >
            try logging in again
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
