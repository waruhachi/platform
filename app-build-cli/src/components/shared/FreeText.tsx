import React from 'react';
import { Box, Text } from 'ink';
import { TextInput as InkTextInput } from '@inkjs/ui';

export type FreeTextProps = {
	question: string;
	onSubmit: (value: string) => void;
	placeholder?: string;
};

export const FreeText = ({
	question,
	onSubmit,
	placeholder,
}: FreeTextProps) => {
	return (
		<Box
			flexDirection="column"
			padding={1}
			borderStyle="round"
			borderColor="blue"
		>
			<Box marginBottom={1}>
				<Text bold>{question}</Text>
			</Box>
			<Box>
				<Text color="blue">❯ </Text>
				<InkTextInput
					placeholder={placeholder}
					onSubmit={(value) => onSubmit(value)}
				/>
			</Box>
		</Box>
	);
};
