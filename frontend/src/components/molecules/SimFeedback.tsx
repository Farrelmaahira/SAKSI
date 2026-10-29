import Cross from '@/components/atoms/Cross'

interface Props {
  message: string | null
}

export default function SimFeedback({ message }: Props) {
  if (!message) return null
  return (
    <p className="sim-feedback is-wrong">
      <Cross />
      {message}
    </p>
  )
}
