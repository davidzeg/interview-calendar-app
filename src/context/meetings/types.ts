import {Meeting} from '../../types';

export interface MeetingsState {
  meetings: Meeting[];
  isLoading: boolean;
  error: string | null;
}

export enum MeetingsActionType {
  SET_MEETINGS = 'SET_MEETINGS',
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
}

export type MeetingsAction =
  | {type: MeetingsActionType.SET_MEETINGS; payload: Meeting[]}
  | {type: MeetingsActionType.SET_LOADING; payload: boolean}
  | {type: MeetingsActionType.SET_ERROR; payload: string | null};
