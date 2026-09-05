import apiClient from "../untils/auth";

export const aiService = {
  getRecommendations: async () => {
    try {
      const res = await apiClient.get("/ai/recommendations");
      return res.data?.data || [];
    } catch (error) {
      console.error("AI Recommendation error:", error);
      return [];
    }
  }
};
