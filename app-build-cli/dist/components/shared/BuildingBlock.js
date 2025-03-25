import { jsx as _jsx } from "react/jsx-runtime";
import { FreeText } from './FreeText.js';
import ConfirmPrompt, {} from './ConfirmPrompt.js';
import { Select } from './Select.js';
import { MultiSelect } from './MultiSelect.js';
export function BuildingBlock(props) {
    switch (props.type) {
        case 'free-text': {
            return _jsx(FreeText, { ...props });
        }
        case 'select':
            return _jsx(Select, { ...props });
        case 'boolean':
            return _jsx(ConfirmPrompt, { ...props });
        case 'multi-select':
            return _jsx(MultiSelect, { ...props });
    }
}
//# sourceMappingURL=BuildingBlock.js.map