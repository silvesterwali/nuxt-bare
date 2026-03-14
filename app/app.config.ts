export default defineAppConfig({
  toaster: {
    duration: 15000,
  },
  ui: {
    colors: {
      primary: "green",
      neutral: "slate",
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
      base: "animate-pulse bg-accented",
    },
    card: {
      slots: {
        root: "shadow-sm",
      },
    },
    table: {
      slots: {
        tbody:
          "isolate [&>tr]:hover:bg-elevated/40 [&>tr]:transition-colors [&>tr]:data-[selectable=true]:hover:bg-elevated/60 [&>tr]:data-[selectable=true]:focus-visible:outline-primary",
        th: "px-4 py-3.5 text-xs font-medium text-muted uppercase tracking-wider text-left rtl:text-right [&:has([role=checkbox])]:pe-0",
      },
    },
  },
});
