import {AuthUser} from './local-state';

export enum ActionType {
  AUTH_STATE_CHANGE = 'AUTH_STATE_CHANGED',
}

export type Action = {
  type: ActionType;
  payload: {
    isAuthenticated?: boolean;
    user?: AuthUser | null;
    isInitialized?: boolean;
  };
};
