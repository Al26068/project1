import { PlusIcon } from '../common/icons'
import './AddWorkplaceButton.css'

interface AddWorkplaceButtonProps {
  onClick: () => void
}

function AddWorkplaceButton({ onClick }: AddWorkplaceButtonProps) {
  return (
    <button
      type="button"
      className="add-workplace-button"
      onClick={onClick}
      aria-label="職場を追加"
    >
      <PlusIcon className="add-workplace-button__icon" />
    </button>
  )
}

export default AddWorkplaceButton
