import axios from "axios";

import { ENDPOINTS } from "utils/URL";

export const addEquipmentType = async (body) => {
  return axios.post(`${ENDPOINTS.BM_INVTYPE_ROOT}/equipment`, body)
    .then(res => res)
    .catch((err) => {
      if (err.response) return err.response
      if (err.request) return err.request
      return err.message
    })
}