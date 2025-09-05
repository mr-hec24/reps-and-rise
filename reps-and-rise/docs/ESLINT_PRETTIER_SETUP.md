# ESLint and Prettier Setup

This project is configured with modern ESLint and Prettier setups for
TypeScript, React, React Native, and Expo development.

## Configuration Files

### ESLint Configuration (`eslint.config.mjs`)

- Uses the new ESLint flat config format (ESLint v9+)
- Separate configurations for TypeScript and JavaScript files
- Includes rules for TypeScript, React, React Hooks, and Prettier integration
- React Native plugin temporarily disabled due to ESLint v9 compatibility issues

### Prettier Configuration (`.prettierrc.js`)

- Modern formatting rules optimized for TypeScript and React development
- Single quotes, semicolons, and trailing commas for ES5 compatibility
- 100 character line width for better readability
- Specific overrides for JSON, Markdown, and YAML files

### VS Code Integration (`.vscode/settings.json`)

- Format on save enabled
- ESLint auto-fix on save
- Prettier as default formatter for all supported file types
- Optimized workspace settings for the project structure

## Available Scripts

```bash
# Linting
npm run lint          # Check for linting errors
npm run lint:fix      # Fix auto-fixable linting errors

# Formatting
npm run format        # Format all files with Prettier
npm run format:check  # Check if files are properly formatted

# Type checking
npm run type-check    # Run TypeScript compiler without emitting files

# Combined check
npm run check-all     # Run type-check, lint, and format:check
```

## Features

### ESLint Rules

- **TypeScript**: Strict type checking with sensible defaults
- **React**: Modern React patterns (no React import required)
- **React Hooks**: Proper hooks usage validation
- **Code Quality**: Prefer const, object shorthand, template literals
- **Import/Export**: No duplicate imports

### Prettier Formatting

- **Consistency**: Uniform code style across the project
- **Modern**: ES6+ friendly formatting
- **Cross-platform**: Consistent line endings (LF)
- **Readable**: Optimized spacing and line breaks

### VS Code Integration

- **Auto-format**: Files are formatted on save
- **Auto-fix**: ESLint errors are fixed on save when possible
- **IntelliSense**: Full TypeScript and React support
- **Extensions**: Recommended extensions for optimal development experience

## Recommended VS Code Extensions

The project includes extension recommendations in `.vscode/extensions.json`:

- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Expo Tools

## Notes

- React Native ESLint plugin is temporarily disabled due to compatibility issues
  with ESLint v9
- Console statements are allowed but generate warnings (useful for development)
- The configuration supports both iOS, Android, and Web platforms
- All configuration files are optimized for the Expo and Supabase stack

## Troubleshooting

If you encounter issues:

1. **ESLint parsing errors**: Make sure you're using the correct file extensions
   and the files are included in `tsconfig.json`
2. **Prettier conflicts**: Run `npm run format` to fix formatting issues
3. **VS Code not formatting**: Check that the Prettier extension is installed
   and enabled
4. **Type errors**: Run `npm run type-check` to see TypeScript errors

## Future Updates

When the React Native ESLint plugin becomes compatible with ESLint v9, it can be
re-enabled by:

1. Uncommenting the import in `eslint.config.mjs`
2. Adding it back to the plugins configuration
3. Re-enabling the React Native specific rules
