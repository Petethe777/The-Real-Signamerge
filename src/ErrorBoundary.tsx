import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Without this, any uncaught error anywhere in the app causes React to
// unmount the entire tree, leaving a blank white screen with zero
// information. This catches that and shows the actual error instead, so
// it can be diagnosed instead of being an invisible failure.
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  declare props: { children: React.ReactNode };
  state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: { children: React.ReactNode }) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught a rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "sans-serif",
          textAlign: "center",
          background: "#fff7ed",
        }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem", color: "#111" }}>
            Something went wrong.
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem", maxWidth: "32rem" }}>
            The app hit an error while loading. The details below will help identify exactly what broke.
          </p>
          <pre style={{
            background: "#fff",
            border: "1px solid #fed7aa",
            borderRadius: "0.75rem",
            padding: "1rem",
            maxWidth: "40rem",
            overflow: "auto",
            fontSize: "0.8rem",
            color: "#b91c1c",
            textAlign: "left",
          }}>
            {this.state.error?.message}
            {"\n\n"}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1.5rem",
              background: "#ea580c",
              color: "#fff",
              fontWeight: 700,
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
