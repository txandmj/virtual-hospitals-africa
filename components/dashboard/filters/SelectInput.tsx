export type SelectOption = { value: string; label: string }

export type SelectInputProps = {
  param: string
  value: string | null
  options: readonly SelectOption[]
  placeholder?: string
}

export default function SelectInput(
  { param, value, options, placeholder = 'All' }: SelectInputProps,
) {
  return (
    <label class='flex flex-col text-sm text-gray-600'>
      {param}
      <select
        name={param}
        class='rounded border border-gray-300 px-2 py-1'
      >
        <option value='' selected={value === null}>{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} selected={value === o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
