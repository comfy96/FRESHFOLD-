import fs from 'fs';
import path from 'path';

export interface EmailDesignTokens {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  surface: string;
  surfaceContainerLow: string;
  onSurface: string;
  onSurfaceVariant: string;
  outlineVariant: string;
  fontSans: string;
}

function parseCssVars(css: string): Map<string, string> {
  const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
  const lightBlock = rootMatch ? rootMatch[1] : css;
  const vars = new Map<string, string>();
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(lightBlock)) !== null) {
    vars.set(m[1], m[2].trim());
  }
  return vars;
}

function resolveVar(vars: Map<string, string>, name: string, depth = 0): string {
  if (depth > 5) return '';
  const raw = vars.get(name) ?? '';
  const match = raw.match(/^var\((--[a-z0-9-]+)\)$/i);
  if (match) {
    return resolveVar(vars, match[1], depth + 1);
  }
  return raw;
}

/**
 * Resolve Task 1 semantic colour tokens directly from `src/styles/variables.css`
 * for inline HTML email styling (where external CSS custom properties are stripped).
 */
export function loadEmailTokens(): EmailDesignTokens {
  const cssPath = path.resolve(process.cwd(), 'src/styles/variables.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  const vars = parseCssVars(css);

  return {
    primary: resolveVar(vars, '--color-primary'),
    onPrimary: resolveVar(vars, '--color-on-primary'),
    primaryContainer: resolveVar(vars, '--color-primary-containr'),
    onPrimaryContainer: resolveVar(vars, '--color-on-primary-container'),
    surface: resolveVar(vars, '--color-surface'),
    surfaceContainerLow: resolveVar(vars, '--color-surface-container-low'),
    onSurface: resolveVar(vars, '--color-on-surface'),
    onSurfaceVariant: resolveVar(vars, '--color-on-surface-variant'),
    outlineVariant: resolveVar(vars, '--color-outline-variant'),
    fontSans: resolveVar(vars, '--type-body-large-font-family') || "'Plus Jakarta Sans', Arial, sans-serif",
  };
}
