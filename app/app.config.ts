export default defineAppConfig({
  toaster: {
    duration: 15000,
  },
  ui: {
    colors: {
      primary: "green",
      neutral: "zinc",
      black: "black",
      orange: "orange",
    },
    input: {
      class: "w-full",
      defaultVariants: {
        size: "xl",
      },
    },
    select: {
      class: "w-full",
      defaultVariants: {
        size: "xl",
      },
    },
    selectMenu: {
      class: "w-full",
      defaultVariants: {
        size: "xl",
      },
    },
    button: {
      defaultVariants: {
        size: "xl",
      },
    },
    toaster: {
      defaultVariants: {
        position: "top-right" as const,
        duration: 15000,
      },
    },
    skeleton: {
      base: "bg-gray-200",
    },
  },
});
