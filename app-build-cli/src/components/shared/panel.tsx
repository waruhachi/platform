import { Box, Text, type BoxProps } from 'ink';

type PanelProps = {
  children: React.ReactNode;
  title?: string;
  variant?: 'default' | 'info';
  boxProps?: BoxProps;
};

const variantColors = {
  info: {
    borderColor: '#1d4ed8',
  },
  default: {
    borderColor: '#3a3a3a',
  },
};

export function Panel({
  children,
  title,
  variant = 'default',
  boxProps,
}: PanelProps) {
  const { borderColor } = variantColors[variant];

  return (
    <Box
      borderStyle="round"
      borderColor={borderColor}
      flexDirection="column"
      padding={1}
      {...boxProps}
    >
      {title && (
        <Box marginBottom={2}>
          <Text bold>{title}</Text>
        </Box>
      )}
      {children}
    </Box>
  );
}
