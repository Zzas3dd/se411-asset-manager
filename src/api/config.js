// Base URL of the Spring Boot backend.
// Override it with VITE_API_URL in a .env file if the backend runs elsewhere.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";
