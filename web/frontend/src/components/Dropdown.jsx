/* eslint-disable react/prop-types */
export default function Dropdown({ options, selectedValue, onChange, label }) {
  return (
    <div className="flex items-center gap-2 my-1">
      <label className="text-sm min-w-[100px]">{label}</label>
      <select
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer w-[300px] px-2 py-0 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="hi">Select an option</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.Name}
          </option>
        ))}
      </select>
    </div>
  );
}
