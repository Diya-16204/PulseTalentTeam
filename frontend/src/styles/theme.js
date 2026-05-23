/**
 * Global App Styles
 * Common styles and CSS variables
 */

export const styles = {
  colors: {
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#818cf8',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#1f2937',
    textLight: '#6b7280',
    border: '#e5e7eb'
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    xxl: '4rem'
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  }
};

export const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${styles.colors.background};
    color: ${styles.colors.text};
  }

  a {
    color: ${styles.colors.primary};
    text-decoration: none;
  }

  a:hover {
    color: ${styles.colors.primaryDark};
  }

  button {
    cursor: pointer;
    border: none;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: 1rem;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${styles.spacing.md};
  }

  .text-center {
    text-align: center;
  }

  .mt-sm { margin-top: ${styles.spacing.sm}; }
  .mt-md { margin-top: ${styles.spacing.md}; }
  .mt-lg { margin-top: ${styles.spacing.lg}; }

  .mb-sm { margin-bottom: ${styles.spacing.sm}; }
  .mb-md { margin-bottom: ${styles.spacing.md}; }
  .mb-lg { margin-bottom: ${styles.spacing.lg}; }

  .p-sm { padding: ${styles.spacing.sm}; }
  .p-md { padding: ${styles.spacing.md}; }
  .p-lg { padding: ${styles.spacing.lg}; }

  .flex { display: flex; }
  .flex-col { display: flex; flex-direction: column; }
  .flex-center { display: flex; align-items: center; justify-content: center; }
  .flex-between { display: flex; align-items: center; justify-content: space-between; }

  .gap-sm { gap: ${styles.spacing.sm}; }
  .gap-md { gap: ${styles.spacing.md}; }
  .gap-lg { gap: ${styles.spacing.lg}; }

  .rounded-md { border-radius: ${styles.borderRadius.md}; }
  .rounded-lg { border-radius: ${styles.borderRadius.lg}; }

  .shadow-md { box-shadow: ${styles.shadows.md}; }
  .shadow-lg { box-shadow: ${styles.shadows.lg}; }
`;
