interface ApiFetchOptions extends RequestInit {}

export const apiFetch = async (
  url: string,
  options: ApiFetchOptions = {}
) => {
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const getDashboardSummary = () => {
  return apiFetch("/api/dashboard/summary");
};