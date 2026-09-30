const API_URL = "http://localhost:5000";
export async function checkServer() {
  const response = await fetch(`${API_URL}/`);

  if (!response.ok) {
    throw new Error("Server request failed");
  }

  return response.json();
}