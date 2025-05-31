export const customSelectStyles = {
  control: (base) => ({
    ...base,
    minHeight: '48px',
    borderRadius: '0.75rem',
    borderColor: '#FFE1F3',
    borderWidth: '2px',
    '&:hover': {
      borderColor: '#E01D42'
    }
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#FFE1F3',
    borderRadius: '0.5rem',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#4A0635',
    padding: '2px 8px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#E01D42',
    ':hover': {
      backgroundColor: '#E01D42',
      color: 'white',
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
}; 