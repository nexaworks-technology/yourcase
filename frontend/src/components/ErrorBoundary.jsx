import { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from './ui/Button'
import { Alert } from './ui/Alert'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
          <div className="max-w-lg rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-xl">
            <Alert variant="error" title="Something went wrong" message={this.state.error?.message || 'An unexpected error occurred.'} />
            <div className="mt-6 flex justify-center">
              <Button onClick={this.handleReset}>Reload application</Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
}
