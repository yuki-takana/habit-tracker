export class ApiClient {
  private static async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(error.message || "API request failed");
      }
      throw new Error(`API request failed with status: ${response.status}`);
    }

    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    
    return {} as T;
  }

  // --- TODOS API ---
  
  static async createTodo(data: any) {
    return this.fetch(`/api/todos`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateTodo(id: string, data: any) {
    return this.fetch(`/api/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async toggleTodoComplete(id: string, completed: boolean) {
    return this.updateTodo(id, { completed });
  }

  static async startTodo(id: string) {
    return this.updateTodo(id, {
      startedAt: new Date().toISOString(),
      status: "in_progress",
    });
  }

  static async delayTodo(
    id: string,
    startTime: string,
    deadline: string | undefined,
    delayCount: number
  ) {
    return this.updateTodo(id, {
      startTime,
      ...(deadline && { deadline }),
      delayCount,
      lastDelayedAt: new Date().toISOString(),
      status: "upcoming",
    });
  }
}
