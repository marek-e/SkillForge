import { Link } from "@tanstack/react-router";
import { AlertCircleIcon, ArrowLeftIcon, RotateCcwIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";

interface ErrorContainerProps {
  title?: string;
  message: string;
  backTo?: string;
  backLabel?: string;
  onRetry?: () => void;
}

export function ErrorContainer({
  title = "Something went wrong",
  message,
  backTo,
  backLabel = "Go back",
  onRetry,
}: ErrorContainerProps) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      {(backTo || onRetry) && (
        <div className="flex items-center gap-2">
          {backTo && (
            <Button variant="outline" size="sm" asChild>
              <Link to={backTo}>
                <ArrowLeftIcon />
                {backLabel}
              </Link>
            </Button>
          )}
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RotateCcwIcon />
              Retry
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
