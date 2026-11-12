const fs = require('fs');
const path = require('path');

const completeTokensPath = path.resolve(__dirname, '../evidence/06-tokens-complete.json');
const lightRolesPath = path.resolve(__dirname, '../docs/design-system/Color Roles.Light Mode.tokens.json');
const darkRolesPath = path.resolve(__dirname, '../docs/design-system/Color Roles.Dark Mode.tokens.json');
const outputPath = path.resolve(__dirname, '../../src/styles/variables.css');

const completeTokens = JSON.parse(fs.readFileSync(completeTokensPath, 'utf8'));
const lightRoles = JSON.parse(fs.readFileSync(lightRolesPath, 'utf8'));
const darkRoles = JSON.parse(fs.readFileSync(darkRolesPath, 'utf8'));

function toKebab(str) {
  return str
    .trim()
    .replace(/[_\s]+/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function stripAlphaFF(hex) {
  if (typeof hex === 'string' && hex.length === 9 && hex.toLowerCase().endsWith('ff')) {
    return hex.slice(0, 7).toUpperCase();
  }
  return hex.toUpperCase();
}

function resolveTokenRef(refString) {
  // Converts "{Color_pallete.Primary.primary_40}" -> "var(--primitive-color-primary-40)"
  const inner = refString.replace(/^\{|\}$/g, '');
  const parts = inner.split('.');
  const leaf = parts[parts.length - 1].toLowerCase();
  // Normalize typos in Figma keys to consistent primitive variable names
  const normalized = leaf
    .replace(/^pimary_/, 'primary-')
    .replace(/^tertiay_/, 'tertiary-')
    .replace(/_/g, '-');
  return `var(--primitive-color-${normalized})`;
}

let css = `/**\n * Fresh Fold Laundry Design System - Semantic CSS Variables\n * Compiled from 06-tokens-complete.json + Color Roles (Light & Dark Mode)\n * STRICT RULE: UI components MUST consume semantic roles (--color-*), NEVER primitives.\n */\n\n:root {\n`;

// 1. Tier 1 Primitives from 06-tokens-complete.json
css += `  /* --- Tier 1: Primitive Color Palettes (Internal Only) --- */\n`;
let primitiveCount = 0;
const palettes = completeTokens.primitives['color pallete'];
for (const [groupName, tones] of Object.entries(palettes)) {
  for (const [toneKey, obj] of Object.entries(tones)) {
    const cleanKey = toKebab(
      toneKey
        .replace(/^pimary\s+/i, 'primary ')
        .replace(/^tertiay\s+/i, 'tertiary ')
    );
    css += `  --primitive-color-${cleanKey}: ${stripAlphaFF(obj.value)};\n`;
    primitiveCount++;
  }
}

// 2. Tier 2 Semantic Roles (Light Mode default from Color Roles.Light Mode.tokens.json)
css += `\n  /* --- Tier 2: Semantic Color Roles - Light Mode (Consumable by UI) --- */\n`;
let roleCount = 0;
for (const [roleName, obj] of Object.entries(lightRoles)) {
  const varName = `--color-${toKebab(roleName)}`;
  css += `  ${varName}: ${resolveTokenRef(obj.$value)};\n`;
  roleCount++;
}

// Functional convenience roles derived from Figma Success & Warning primitives
css += `  --color-success: var(--primitive-color-success-40);\n`;
css += `  --color-on-success: var(--primitive-color-success-100);\n`;
css += `  --color-success-container: var(--primitive-color-success-90);\n`;
css += `  --color-on-success-container: var(--primitive-color-success-10);\n`;
css += `  --color-warning: var(--primitive-color-warning-40);\n`;
css += `  --color-on-warning: var(--primitive-color-warning-100);\n`;
roleCount += 6;

// 3. Elevation / Shadows (Brand-Tinted #007B71 -> rgb(0, 123, 113))
// Note: 06-tokens-complete.json exported only soft shadow with stale #c2410c1f;
// medium and hard shadows + primary tint aligned per docs/shadows.md.
css += `\n  /* --- Elevation / Shadows (Brand-Tinted #007B71) --- */\n`;
css += `  --shadow-soft: 0px 4px 2px -2px rgba(0, 123, 113, 0.12);\n`;
css += `  --shadow-medium: 0px 8px 24px -4px rgba(0, 123, 113, 0.20);\n`;
css += `  --shadow-hard: 0px 16px 32px 0px rgba(0, 123, 113, 0.28);\n`;

// 4. Typography Scale (15 Styles matching Figma Plus Jakarta Sans + docs/type-scale.md)
const typographyScale = {
  'display-large':   { weight: 700, size: '57px', line: '80px', tracking: '-0.25px' },
  'display-medium':  { weight: 700, size: '45px', line: '63px', tracking: '-0.15px' },
  'display-small':   { weight: 600, size: '36px', line: '50px', tracking: '0px' },
  'headline-large':  { weight: 600, size: '32px', line: '45px', tracking: '0px' },
  'headline-medium': { weight: 600, size: '28px', line: '39px', tracking: '0px' },
  'headline-small':  { weight: 600, size: '24px', line: '34px', tracking: '0px' },
  'title-large':     { weight: 600, size: '22px', line: '33px', tracking: '0px' },
  'title-medium':    { weight: 500, size: '16px', line: '24px', tracking: '0.15px' },
  'title-small':     { weight: 500, size: '14px', line: '21px', tracking: '0.1px' },
  'body-large':      { weight: 400, size: '16px', line: '24px', tracking: '0.25px' },
  'body-medium':     { weight: 400, size: '14px', line: '21px', tracking: '0.25px' },
  'body-small':      { weight: 400, size: '12px', line: '18px', tracking: '0.4px' },
  'label-large':     { weight: 600, size: '14px', line: '20px', tracking: '0.1px' },
  'label-medium':    { weight: 500, size: '12px', line: '17px', tracking: '0.5px' },
  'label-small':     { weight: 500, size: '11px', line: '15px', tracking: '0.5px' }
};

css += `\n  /* --- Typography Scale (15 Styles - Plus Jakarta Sans) --- */\n`;
for (const [style, specs] of Object.entries(typographyScale)) {
  const prefix = `--type-${style}`;
  css += `  ${prefix}-font-family: Plus Jakarta Sans, sans-serif;\n`;
  css += `  ${prefix}-font-weight: ${specs.weight};\n`;
  css += `  ${prefix}-font-size: ${specs.size};\n`;
  css += `  ${prefix}-line-height: ${specs.line};\n`;
  css += `  ${prefix}-letter-spacing: ${specs.tracking};\n`;
}

css += `}\n\n`;

// 5. Dark Mode Overrides from Color Roles.Dark Mode.tokens.json
css += `[data-theme="dark"] {\n`;
for (const [roleName, obj] of Object.entries(darkRoles)) {
  const varName = `--color-${toKebab(roleName)}`;
  css += `  ${varName}: ${resolveTokenRef(obj.$value)};\n`;
}
css += `  --color-success: var(--primitive-color-success-80);\n`;
css += `  --color-on-success: var(--primitive-color-success-20);\n`;
css += `  --color-success-container: var(--primitive-color-success-30);\n`;
css += `  --color-on-success-container: var(--primitive-color-success-90);\n`;
css += `  --color-warning: var(--primitive-color-warning-80);\n`;
css += `  --color-on-warning: var(--primitive-color-warning-20);\n`;
css += `}\n`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, css, 'utf8');

console.log(`Compiled design tokens to: ${outputPath}`);
console.log(`Primitives exported: ${primitiveCount}`);
console.log(`Semantic roles exported: ${roleCount}`);
console.log(`Shadows exported: 3`);
console.log(`Typography styles exported: ${Object.keys(typographyScale).length}`);
