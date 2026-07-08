import { useState } from 'react'
import { Input, InputNumber } from 'antd'

function EditableCell({ value, onChange, type = 'text', placeholder = '' }) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value)

  const handleBlur = () => {
    setEditing(false)
    onChange(inputValue)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditing(false)
      onChange(inputValue)
    }
  }

  if (editing) {
    if (type === 'number' || type === 'price') {
      return (
        <InputNumber
          autoFocus
          value={inputValue}
          onChange={setInputValue}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{ width: '100%' }}
          min={0}
          step={type === 'price' ? 0.01 : 1}
          precision={type === 'price' ? 2 : 0}
        />
      )
    }
    return (
      <Input
        autoFocus
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    )
  }

  return (
    <div className="editable-cell" onClick={() => setEditing(true)}>
      {value !== '' && value !== undefined && value !== null
        ? value
        : <span style={{ color: '#bfbfbf' }}>{placeholder}</span>
      }
    </div>
  )
}

export default EditableCell
