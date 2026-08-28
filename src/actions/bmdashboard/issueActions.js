import axios from "axios";
import { SET_ISSUES } from "~/constants/bmdashboard/issueConstants";
import { GET_ERRORS } from "~/constants/errors";
import { toast } from "react-toastify";
import { ENDPOINTS } from "~/utils/URL";

export const setIssues = payload => {
  return {
    type: SET_ISSUES,
    payload,
  };
};

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload,
  };
};

export const fetchAllIssues = () => {
  return async dispatch => {
    axios
      .get(`${ENDPOINTS.BM_INJURY_ISSUE}/list`)
      .then(res => {
        dispatch(setIssues(res.data));
      })
      .catch(err => {
        dispatch(setErrors(err));
      });
  };
};

export const renameIssue = (issueId, newName) => {
  return async dispatch => {
    try {
      const res = await axios.put(`${ENDPOINTS.BM_INJURY_ISSUE}/${issueId}/rename`, {
        newName,
      });
      dispatch(fetchAllIssues());
      toast.success(res.data.message || "Issue renamed successfully");
      return res.data;
    } catch (err) {
      dispatch(setErrors(err));
      toast.error("Failed to rename issue");
      throw err;
    }
  };
};

export const copyIssue = issueId => {
  return async dispatch => {
    try {
      const res = await axios.post(`${ENDPOINTS.BM_INJURY_ISSUE}/${issueId}/copy`);
      dispatch(fetchAllIssues());
      toast.success(res.data.message || "Issue copied successfully");
      return res.data;
    } catch (err) {
      dispatch(setErrors(err));
      toast.error("Failed to copy issue");
      throw err;
    }
  };
};

export const deleteIssue = issueId => {
  return async dispatch => {
    try {
      const res = await axios.delete(`${ENDPOINTS.BM_INJURY_ISSUE}/${issueId}`);
      dispatch(fetchAllIssues());
      toast.success(res.data.message || "Issue deleted successfully");
      return res.data;
    } catch (err) {
      dispatch(setErrors(err));
      toast.error("Failed to delete issue");
      throw err;
    }
  };
};
