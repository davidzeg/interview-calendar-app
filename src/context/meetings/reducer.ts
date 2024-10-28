import {MeetingsState, MeetingsAction, MeetingsActionType} from './types';

export const initialState: MeetingsState = {
  meetings: [],
  isLoading: true,
  error: null,
};

export const meetingsReducer = (
  state: MeetingsState,
  action: MeetingsAction,
): MeetingsState => {
  switch (action.type) {
    case MeetingsActionType.SET_MEETINGS:
      return {
        ...state,
        meetings: action.payload,
        error: null,
      };
    case MeetingsActionType.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case MeetingsActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
};
