import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("CablePro render error", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
          <div className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-6 shadow-sm">
            <p className="text-lg font-semibold text-red-700">CablePro could not render this screen</p>
            <p className="mt-2 text-sm text-slate-600">
              Refresh the page or log in again. The error has been printed to the browser console.
            </p>
            <pre className="mt-4 max-h-40 overflow-auto rounded-md bg-slate-950 p-3 text-left text-xs text-white">
              {this.state.error?.message || "Unknown render error"}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
