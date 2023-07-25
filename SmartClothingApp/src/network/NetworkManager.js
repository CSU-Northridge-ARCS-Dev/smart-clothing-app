import axios from "axios";
import { AppConfig } from "./config";

const apiClient = axios.create({
  baseURL: AppConfig.baseUrl,
  timeout: AppConfig.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => {
    return { ...response.data, status: response.status };
  },
  (error) => Promise.reject(error)
);

export class NetworkManager {
  static MyInstance;
  static getInstance() {
    if (!NetworkManager.MyInstance) {
      NetworkManager.MyInstance = new NetworkManager();
    }
    return NetworkManager.MyInstance;
  }
  apiClient = apiClient;
  appRequest = async (options) => {
    return apiClient(options);
  };
}
