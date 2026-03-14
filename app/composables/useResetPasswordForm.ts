import type { FormSubmitEvent } from "@nuxt/ui";
import type { ResetPasswordInput } from "~~/shared/utils/schema/auth";

export const useResetPasswordForm = () => {
  const { resetPassword, loading } = useAuth();
  const route = useRoute();
  const toast = useToast();
  const token = computed(() => route.query.token as string);

  // resetPasswordSchema auto-imported from shared/utils/schema/auth.ts
  const state = reactive({
    password: "",
    confirmPassword: "",
  });

  type Schema = ResetPasswordInput;

  async function onSubmit(event: FormSubmitEvent<Schema>) {
    if (!token.value) {
      toast.add({
        title: "Error",
        description: "Invalid or missing token",
        color: "error",
      });
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
    schema: resetPasswordSchema,
    state,
    onSubmit,
    loading,
    token,
  };
};
