import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-fallback" role="alert">
          The discharge planner could not render. Refresh and retry the demo workflow.
        </main>
      );
    }
    return this.props.children;
  }
}
