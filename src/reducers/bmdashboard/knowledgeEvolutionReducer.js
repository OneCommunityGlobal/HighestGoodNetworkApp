import {
  FETCH_KNOWLEDGE_EVOLUTION_DATA_REQUEST,
  FETCH_KNOWLEDGE_EVOLUTION_DATA_SUCCESS,
  FETCH_KNOWLEDGE_EVOLUTION_DATA_FAILURE,
} from '../../constants/bmdashboard/knowledgeEvolutionConstants';

const initialState = {
  loading: false,
  data: null,
  error: null,
};

// eslint-disable-next-line default-param-last
const knowledgeEvolutionReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_KNOWLEDGE_EVOLUTION_DATA_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_KNOWLEDGE_EVOLUTION_DATA_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case FETCH_KNOWLEDGE_EVOLUTION_DATA_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default knowledgeEvolutionReducer;
