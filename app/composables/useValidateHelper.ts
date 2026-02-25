import type { FormError } from "@nuxt/ui";

export const useValidateHelper = () => {
  /**
   * Transform API validation errors to Nuxt UI form errors
   */
  const transformToIssue = (error: any): FormError[] => {
    const errors: FormError[] = [];

    // specific handling for h3-zod or Standard API errors
    if (error?.data?.data?.issues) {
      // h3-zod pattern if it returns zod issues directly
      error.data.data.issues.forEach((issue: any) => {
        errors.push({
          message: issue.message,
          name: issue.path.join("."),
        });
      });
    } else if (error?.data?.startLine) {
      // Fallback for some error structures
    }

    // If we have a standard Validation Error format from our backend
    // Assuming backend returns { message: "Validation Failed", data: { fieldName: "Error message" } }
    if (error?.data?.data && typeof error.data.data === "object") {
      Object.entries(error.data.data).forEach(([key, value]) => {
        errors.push({
          name: key,
          message: Array.isArray(value) ? value.join(", ") : String(value),
        });
      });
    }

    // Default to generic error if no specific field errors
    if (errors.length === 0 && error?.data?.message) {
      // Can't map to a specific field easily without path, but could add a general error
    }

    return errors;
  };

  return {
    transformToIssue,
  };
};
