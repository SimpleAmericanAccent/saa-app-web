/* eslint-disable react/prop-types */
export default function Dropdown({ options, selectedValue, onChange, label }) {
  return (
    <div>
      <label>{label}</label>
      <select value={selectedValue} onChange={(e) => onChange(e.target.value)}>
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
