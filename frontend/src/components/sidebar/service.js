export const fetchAuthUser = async () => {
  try {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
    });

    // If the response is not OK (e.g., 401 Unauthorized, 403 Forbidden),
    // or if the backend explicitly sends an error in the JSON body,
    // we should treat the user as unauthenticated.
    if (!res.ok) {
      // Log the error for debugging, but return null
      const errorData = await res.json().catch(() => ({})); // Catch JSON parse errors
      console.error(
        "fetchAuthUser: Auth check failed:",
        res.status,
        errorData.error || "Unknown error"
      );
      return null; // Explicitly return null if not authenticated
    }

    const data = await res.json();

    // If the backend sends a 200 OK but the data itself indicates an error (e.g., { error: "Not logged in" })
    if (data.error) {
      console.error("fetchAuthUser: Auth check data error:", data.error);
      return null; // Explicitly return null
    }

    return data; // Return the authenticated user data
  } catch (error) {
    // Catch network errors or other unexpected issues during the fetch itself
    console.error("fetchAuthUser: Error during auth check:", error);
    return null; // Return null on any error to ensure logout state
  }
};
