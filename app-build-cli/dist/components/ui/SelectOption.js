import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
export const SelectOption = ({ label, isSelected, isHighlighted, }) => {
    return (_jsx(Box, { children: _jsxs(Text, { color: isHighlighted ? 'blue' : 'white', children: [isSelected ? '● ' : '○ ', _jsx(Text, { bold: isHighlighted, children: label })] }) }));
};
//# sourceMappingURL=SelectOption.js.map