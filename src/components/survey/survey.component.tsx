import * as React from 'react';
import { Switch, Route } from 'react-router';
import SurveyNavComponent from './survey-nav/survey-nav.component'
import AssignedSurveysComponent from './assigned-surveys/assigned-surveys.component';
import SurveyBuildComponent from './survey-build/survey-build.component';
import SurveyAnalyticsComponent from './survey-analytics/survey-analytics.component';
import SurveyTakingComponent from './survey-taking/survey-taking.component';
import AllSurveysComponent from './all-surveys/all-surveys.component';
import TemplatesComponent from './templates/templates.component';


export class SurveyComponent extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
  }

  updateSurveyTable = (groupName: string) => {
    this.props.manageGetUsersByGroup(groupName);
  }

  render() {
    let { path } = this.props.match;
    console.log(path);
    return (
      <div id="manage-users-container">
        <SurveyNavComponent
          toggleCreateUserModal={this.props.toggleCreateUserModal}
          updateSurveyTable={this.updateSurveyTable}
          manage={this.props.match.params.manage}
          history={this.props.history}
          location={this.props.location}
          match={this.props.match} />
        
        <Switch>
          <Route exact path={`${path}`} component={AssignedSurveysComponent} />
          <Route path={`${path}/assigned`} component={AssignedSurveysComponent} />
          <Route path={`${path}/all-surveys`} component={AllSurveysComponent} />
          <Route path={`${path}/build`} component={SurveyBuildComponent} />
          <Route path={`${path}/templates`} component={TemplatesComponent} />
          <Route path={`${path}/survey-data/:surveyId`} component={SurveyAnalyticsComponent} />
          <Route path={`${path}/survey-taking/:surveyId`} component={SurveyTakingComponent} />
         
        </Switch>
      </div>
    )
  }
}

