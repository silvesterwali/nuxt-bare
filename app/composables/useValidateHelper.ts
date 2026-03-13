import type { FormError } from "@nuxt/ui";

export const useValidateHelper = () => {
  /**
   * Transform API validation errors to Nuxt UI form errors
   * Handles FetchError extraction from ofetch, h3 validation errors, and Zod issues
   */
  const transformToIssue = (error: any): FormError[] => {
    const errors: FormError[] = [];

    // First, extract the actual error data from FetchError structure
    // FetchError from ofetch has: error.response._data, error.data, or error itself
    const errorData = error?.response?._data || error?.data || error;

    // Handle direct array of validation issues (from h3 validation)
    // Format: errorData = [{ path: ["name"], message: "Name is required", ... }]
    if (Array.isArray(errorData)) {
      errorData.forEach((issue: any) => {
        errors.push({
          message: issue.message,
          name: issue.path?.join(".") || "",
        });
      });
      return errors;
    }

    // specific handling for validation errors returned by our API
    // h3 built-in validators also produce a Zod-like `issues` array
    if (errorData?.data?.issues) {
      // pattern where issues are sent directly from the server
      errorData.data.issues.forEach((issue: any) => {
        errors.push({
          message: issue.message,
          name: issue.path.join("."),
        });
      });
    } else if (Array.isArray(errorData?.data)) {
      // Some responses return errors directly as an array of Zod issues
      errorData.data.forEach((issue: any) => {
        errors.push({
          message: issue.message,
          name: issue.path?.join(".") || "",
        });
      });
    } else if (errorData?.data?.startLine) {
      // Fallback for some error structures
    }

    // If we have a standard Validation Error format from our backend
    // Assuming backend returns { message: "Validation Failed", data: { fieldName: "Error message" } }
    if (
      errorData?.data &&
      typeof errorData.data === "object" &&
      !Array.isArray(errorData.data)
    ) {
      // Can't map to a specific field easily without path, but could add a general error
    }

    return errors;
  };

  return {
    transformToIssue,
  };
};
