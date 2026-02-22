declare global {
  const $render: (
    template: string,
    props?: Record<string, any>,
  ) => Promise<{ html: string; text: string }>;
}

export {};
