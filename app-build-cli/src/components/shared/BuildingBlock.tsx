import React from 'react';
import { FreeText, FreeTextProps } from './FreeText.js';
import ConfirmPrompt, { ConfirmPromptProps } from './ConfirmPrompt.js';
import { Select, SelectProps } from './Select.js';
import { MultiSelect, MultiSelectProps } from './MultiSelect.js';

type BuildingBlockProps =
	| ({ type: 'free-text' } & FreeTextProps)
	| ({ type: 'select' } & SelectProps)
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
