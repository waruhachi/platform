import { jsx as _jsx } from "react/jsx-runtime";
import { Box, Text, useInput } from 'ink';
import { useSafeNavigate } from '../../routes.js';
export const ShortcutHints = () => {
    const { goBack } = useSafeNavigate();
    useInput((input, key) => {
        if (key.ctrl && input === 'b') {
            goBack();
        }
    });
    return (_jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Press 'ctrl+b' to go back to the previous step" }) }));
};
//# sourceMappingURL=shortcut-hints.js.map