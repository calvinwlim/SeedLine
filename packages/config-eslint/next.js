/**
 * ESLint config for the Next.js web app.
 * Extends the shared base and layers in Next's recommended rules.
 */
module.exports = {
  extends: ['@seedline/eslint-config', 'next/core-web-vitals'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
