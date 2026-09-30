const API_URL = "https://healthcare-service-companion-backend.onrender.com";
export async function checkServer() {
  const response = await fetch(`${API_URL}/`);

  if (!response.ok) {
    throw new Error("Server request failed");
  }

  return response.json();
}