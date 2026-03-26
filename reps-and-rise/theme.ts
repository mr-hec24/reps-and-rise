export const lightTheme ={
    colors: {
        background: "#Fafaf8",
        text: "#1a1a1a",
        subtext: "#6b7280",
        primary: "#8B7355",
        secondary: "#b8956a",
        card: "#ffffff",
        border: "#e6e2da",
        iconBackground: "#F5F1EB",
        rowItem: "#FAFAF8"
    },
    spacing: {
        xs: 6,
        sm: 10,
        md: 16,
        lg: 24,
        xl: 32,
    },
    radius: {
        xs: 1,
        sm: 8,
        md: 12,
        lg: 20,
    }, 
    font: {
        title: 24,
        subtitle: 18,
        body: 16,
        small: 14,
        weight: {
            regular: "400",
            semibold: "600",
            bold: "700",
        }
    }
};

// For backward compatibility
export const theme = lightTheme;