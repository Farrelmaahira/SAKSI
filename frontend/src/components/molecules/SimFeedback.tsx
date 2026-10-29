import Cross from '@/components/atoms/Cross'

export interface SimFeedbackProps {
  message: string | null
}

export default function SimFeedback({ message }: SimFeedbackProps) {
  if (!message) return null
  return (
    <p className="sim-feedback is-wrong">
      <Cross />
      {message}
    </p>
  )
}
