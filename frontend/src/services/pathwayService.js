import apiClient from "../untils/auth";

export const getMyLearningPathway = async () => {
  try {
    console.log("Fetching learning pathway...");
    const res = await apiClient.get("/pathways/me");
    const pathwayData = res.data?.data || [];
    console.log("Pathway data received:", pathwayData);
    return pathwayData;
  } catch (error) {
    console.error("getMyLearningPathway ERROR:", error.response?.data || error);
    return [];
  }
};

