import { Link } from '@tanstack/react-router'
import { AlertCircleIcon, ArrowLeftIcon, RotateCcwIcon } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  root: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': 0 },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '1rem' },
  },
  actions: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
})

interface ErrorContainerProps {
  title?: string
  message: string
  backTo?: string
  backLabel?: string
  onRetry?: () => void
}

export function ErrorContainer({
  title = 'Something went wrong',
  message,
  backTo,
  backLabel = 'Go back',
  onRetry,
}: ErrorContainerProps) {
  return (
    <div {...stylex.props(styles.root)}>
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      {(backTo || onRetry) && (
        <div {...stylex.props(styles.actions)}>
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
  )
}
