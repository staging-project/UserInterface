import { managerTypes } from '../actions/manager/manager.actions';
import { IManagerState } from '.';
import { toast } from "react-toastify";

const initialState: IManagerState = {
  associates: [],
  checkIns:   [],
  cohorts:    [],
  comment:    '',
  currentCohort:  null
}

export const managerReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case managerTypes.ADD_CHECK_INS:
      let checkIns = state.checkIns;
      checkIns += action.payload.checkIns;
      return {
        ...state,
        checkIns
      }
    case managerTypes.ADD_COHORT:
      let cohorts = state.cohorts;
      cohorts += action.payload.cohort;
      toast.success("Cohort added");
      return {
        ...state,
        cohorts
      }
    case managerTypes.SET_CHECK_IN_COMMENT:
      return {
        ...state,
        comment: action.payload.comment
      }
    case managerTypes.SET_CHECK_IN_LIST:
      return {
        ...state,
        checkIns: action.payload.checkIns
      }
    case managerTypes.SET_COHORT_LIST:
      return {
        ...state,
        cohorts: action.payload.cohorts,
        currentCohort: action.payload.currentCohort
      }
    case managerTypes.SELECT_COHORT:
      return {
        ...state,
        currentCohort: action.payload.currentCohort
      }
  }
  return state;
}