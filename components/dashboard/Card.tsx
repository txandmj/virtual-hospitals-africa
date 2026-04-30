export type CardProps = {
  label: string
  value: number | string
}

export default function Card({ label, value }: CardProps) {
  return (
    <div class='rounded-md border border-gray-200 bg-white p-4 shadow-sm'>
      <div class='text-sm text-gray-500'>{label}</div>
      <div class='mt-1 text-3xl font-semibold text-gray-900'>{value}</div>
    </div>
  )
}
