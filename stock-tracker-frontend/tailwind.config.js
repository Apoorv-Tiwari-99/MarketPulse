    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
      presets: [require("nativewind/preset")],
      theme: {
        extend: {
          colors: {
            primary: '#2563eb',
            secondary: '#64748b',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            background: '#f8fafc',
            card: '#ffffff',
            border: '#e2e8f0',
            text: '#1e293b',
          },
        },
      },
      plugins: [],
    };