import Icon from '@/components/atoms/Icon'

interface Props { text: string }

export default function Locked({ text }: Props) {
  return (
    <p className="d-locked">
      <Icon name="lock" />
      {text}
    </p>
  )
}
