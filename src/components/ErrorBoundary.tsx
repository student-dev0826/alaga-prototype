import { Component, type ReactNode } from 'react';
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="page" role="alert"><h1 className="page-title">This page could not load</h1>
      <p className="mb-5">Reload the page to try again. If the problem continues, return to the home page.</p>
      <button className="button" onClick={() => window.location.reload()}>Try again</button> <a className="button secondary" href="/">Return home</a>
    </main>;
    return this.props.children;
  }
}
