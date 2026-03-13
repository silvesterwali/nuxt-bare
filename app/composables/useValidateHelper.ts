import type { FormError } from "@nuxt/ui";

export const useValidateHelper = () => {
  /**
   * Transform API validation errors to Nuxt UI form errors
   */
  const transformToIssue = (error: any): FormError[] => {
    const errors: FormError[] = [];

    // specific handling for validation errors returned by our API
    // h3 built-in validators also produce a Zod-like `issues` array
    if (error?.data?.data?.issues) {
      // pattern where issues are sent directly from the server
      error.data.data.issues.forEach((issue: any) => {
        errors.push({
          message: issue.message,
          name: issue.path.join("."),
        });
      });
    } else if (Array.isArray(error?.data?.data)) {
      // Some responses return errors directly as an array of Zod issues
      error.data.data.forEach((issue: any) => {
        errors.push({
          message: issue.message,
          name: issue.path?.join(".") || "",
        });
      });
    } else if (error?.data?.startLine) {
      // Fallback for some error structures
    }

    // If we have a standard Validation Error format from our backend
    // Assuming backend returns { message: "Validation Failed", data: { fieldName: "Error message" } }
    if (
      error?.data?.data &&
      typeof error.data.data === "object" &&
      !Array.isArray(error.data.data)
    ) {
      // Can't map to a specific field easily without path, but could add a general error
    }

    return errors;
  };

  return {
    transformToIssue,
  };
};
