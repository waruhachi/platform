import { jsx as _jsx } from "react/jsx-runtime";
import { FreeText } from './free-text.js';
import ConfirmPrompt, {} from './confirm-prompt.js';
import { Select } from './select.js';
import { MultiSelect } from './multi-select.js';
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
//# sourceMappingURL=building-block.js.map