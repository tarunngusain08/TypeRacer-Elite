interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => (
  <div className="text-center p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
    <p className="text-red-500 mb-2">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-sm text-red-400 hover:text-red-300 underline"
      >
        Try Again
      </button>
    )}
  </div>
);

export default ErrorMessage; 