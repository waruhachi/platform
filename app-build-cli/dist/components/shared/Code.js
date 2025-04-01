import { jsx as _jsx } from "react/jsx-runtime";
import SyntaxHighlight from 'ink-syntax-highlight';
export const Code = ({ value, language }) => {
    return _jsx(SyntaxHighlight, { language: language, code: value || ' ' });
};
//# sourceMappingURL=code.js.map