import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "functions/lib", "coverage", "*.config.js", "node_modules"] },
  {
    extends: [
      js.configs.recommended, 
      ...tseslint.configs.recommended,
      jsxA11y.configs.recommended
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      // React Hooks
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      
      // TypeScript
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-const": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      
      // Acessibilidade
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/no-autofocus": "warn",
      
      // Code Quality
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "warn",
      "prefer-template": "warn",
      
      // React específico
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
    },
  },
  
  // Configuração específica para arquivos de teste
  {
    files: ["**/*.test.{ts,tsx}", "**/test-setup.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
  
  // Configuração específica para arquivos de configuração
  {
    files: ["*.config.{js,ts}", "vite.config.ts", "eslint.config.js"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  }
);
