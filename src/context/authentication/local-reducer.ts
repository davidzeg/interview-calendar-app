import {Action, ActionType} from './local-actions';
import {AuthState} from './local-state';

export const authenticationStateReducer = (
  state: AuthState,
  action: Action,
): AuthState => {
  switch (action.type) {
    case ActionType.AUTH_STATE_CHANGE: {
      const {isAuthenticated, user} = action.payload;

      return {
        ...state,
        isAuthenticated,
        isInitialized: true,
        user,
      };
    }

    default: {
      throw new Error(`Unhandled type: ${action.type}`);
    }
  }
};
