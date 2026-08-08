// Re-export so there is only one copy of the ember tokens (theme/DarkTheme.tsx).
export { DefaultTheme as lightTheme, DarkTheme as darkTheme } from './theme/DarkTheme';
export type { Theme } from './theme/DarkTheme';

// For backward compatibility
export { DefaultTheme as theme } from './theme/DarkTheme';
