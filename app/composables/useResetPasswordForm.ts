import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

export const useResetPasswordForm = () => {
  const { resetPassword, loading } = useAuth();
  const route = useRoute();
  const toast = useToast();
  const token = computed(() => route.query.token as string);

  const schema = z
    .object({
      password: z.string().min(8, "Must be at least 8 characters"),
      confirmPassword: z.string().min(8, "Must be at least 8 characters"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  const state = reactive({
    password: "",
    confirmPassword: "",
  });

  type Schema = z.output<typeof schema>;

  async function onSubmit(event: FormSubmitEvent<Schema>) {
    if (!token.value) {
      toast.add({ title: "Error", description: "Invalid or missing token", color: "error" });
      return;
    }

    try {
      await resetPassword({
        token: token.value,
        password: event.data.password,
      });
      // Success toast and navigation are handled in useAuth
    } catch (err: any) {
      // Error handling is in useAuth
    }
  }

  return {
    schema,
    state,
    onSubmit,
    loading,
    token,
  };
};
