import React from 'react';

export default function Dropdown({ value, onChange, options = [] }) {
  return (
    <select value={value} onChange={onChange} className="border rounded px-2 py-1">
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
