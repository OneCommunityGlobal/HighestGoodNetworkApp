import axios from "axios";
import { toast } from "react-toastify";
import { ENDPOINTS } from "~/utils/URL";
import {
  FETCH_KNOWLEDGE_EVOLUTION_DATA_REQUEST,
  FETCH_KNOWLEDGE_EVOLUTION_DATA_SUCCESS,
  FETCH_KNOWLEDGE_EVOLUTION_DATA_FAILURE,
} from "../../constants/bmdashboard/knowledgeEvolutionConstants";


const fetchKnowledgeEvolutionDataSuccess = (data) => ({
  type: FETCH_KNOWLEDGE_EVOLUTION_DATA_SUCCESS,
  payload: data,
});

const fetchKnowledgeEvolutionDataFailure = (error) => ({
  type: FETCH_KNOWLEDGE_EVOLUTION_DATA_FAILURE,
  payload: error,
});

export const fetchKnowledgeEvolutionData = (userId) => {
  return async (dispatch) => {
    try {
      dispatch({ type: FETCH_KNOWLEDGE_EVOLUTION_DATA_REQUEST });
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

      const errorPayload = err.response?.data || { message: err.message };
      dispatch(fetchKnowledgeEvolutionDataFailure(errorPayload));
      toast.error(err.response?.data?.error || "Failed to fetch knowledge evolution data");

      return null;
    }
  };
};

