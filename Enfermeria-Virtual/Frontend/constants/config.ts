export const ENV = process.env.EXPO_PUBLIC_ENV ?? "development";
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://10.0.2.2:3000";

console.log(`🌎 Entorno activo: ${ENV}`);
console.log(`🔗 API: ${API_BASE_URL}`);
