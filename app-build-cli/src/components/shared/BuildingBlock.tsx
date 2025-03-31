import { FreeText, type FreeTextProps } from './FreeText.js';
import ConfirmPrompt, { type ConfirmPromptProps } from './ConfirmPrompt.js';
import { Select, type SelectProps } from './Select.js';
import { MultiSelect, type MultiSelectProps } from './MultiSelect.js';

type BuildingBlockProps =
  | ({ type: 'free-text' } & FreeTextProps)
  | ({ type: 'select' } & SelectProps<string>)
  | ({ type: 'boolean' } & ConfirmPromptProps)
  | ({ type: 'multi-select' } & MultiSelectProps);

export function BuildingBlock(props: BuildingBlockProps) {
  switch (props.type) {
    case 'free-text': {
      return <FreeText {...props} />;
    }
    case 'select':
      return <Select {...props} />;
    case 'boolean':
      return <ConfirmPrompt {...props} />;
    case 'multi-select':
      return <MultiSelect {...props} />;
  }
}
