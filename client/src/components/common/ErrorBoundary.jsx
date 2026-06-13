import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Weblix render error', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center bg-[#0d0d0d] px-4">
          <div className="max-w-xl rounded-lg border border-white/10 bg-[#0A0F2C] p-8 text-center text-white shadow-premium">
            <h1 className="text-3xl font-black">Weblix preview needs a refresh</h1>
            <p className="mt-4 text-white/65">
              The app loaded, but one screen failed to render. Refresh the preview after the dev server restarts.
            </p>
            <pre className="mt-5 overflow-auto rounded-lg bg-[#0d0d0d] p-4 text-left text-xs text-white/70">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
