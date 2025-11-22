import axios from "axios";
import { toast } from "react-toastify";
import { ENDPOINTS } from "~/utils/URL";
import { GET_ERRORS } from "~/constants/errors";
import { FETCH_KNOWLEDGE_EVOLUTION_DATA_REQUEST } from "../../constants/bmdashboard/knowledgeEvolutionConstants";

export const fetchKnowledgeEvolutionData = userId => {
  return async dispatch => {
    try {
      console.log("Fetching Knowledge Evolution for userId:", userId);

      const url = `${ENDPOINTS.KNOWLEDGE_EVOLUTION}/?studentId=${userId}`;
      const res = await axios.get(url);

      console.log("Request sent to:", url);
      console.log("Response data:", res.data);

      dispatch(fetchKnowledgeEvolutionDataSuccess(res.data));
      return res.data;
    } catch (err) {
      console.error("Axios error:", err);

      if (err.response) {
        console.log("Response data:", err.response.data);
        console.log("Response status:", err.response.status);
        console.log("Response headers:", err.response.headers);
      } else if (err.request) {
        console.log("Request sent:", err.request);
      } else {
        console.log("Error message:", err.message);
      }

      dispatch(fetchKnowledgeEvolutionDataFailure(err.response?.data || { message: err.message }));
      toast.error(err.response?.data?.error || "Failed to fetch knowledge evolution data");
      return null;
    }
  };
};

