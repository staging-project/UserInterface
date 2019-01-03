import * as awsCognito from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk';
import { environment } from '../../environment';
import { History } from 'history';
import { ICognitoUser } from '../../model/cognito-user.model';
import { toast } from 'react-toastify';

export const authTypes = {
  LOGOUT: 'LOGOUT',
  UPDATE_CURRENT_USER: 'UPDATE_CURRENT_USER',
}

export const cognitoLogin = (username: string, password: string, history: History) => (dispatch) => {
  const authenticationData = {
    Password: password,
    Username: username,
  };

  const authenticationDetails = new awsCognito.AuthenticationDetails(authenticationData);
  const poolData = {
    ClientId: environment.cognitoClientId,
    UserPoolId: environment.cognitoUserPoolId,
  };

  const userPool = new awsCognito.CognitoUserPool(poolData);
  const userData = {
    Pool: userPool,
    Username: username,
  };

  const cognitoUser = new awsCognito.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    newPasswordRequired: (userAttributes, requiredAttributes) => {
      // dispatch({
      //   payload: {
      //     cogUser: cognitoUser,
      //     isFirstSignin: true
      //   },
      //   type: userTypes.FIRST_SIGN_IN
      // });
      alert('new password required')
    },
    onFailure: (error) => {
      console.log(error);
    },
    onSuccess: (result: awsCognito.CognitoUserSession) => {
      const userAttributes = result.getIdToken().payload;
      const currentUser = {
        email: userAttributes.email,
        roles: userAttributes['cognito:groups'],

      }
      // Set redux cognito data
      dispatch(updateCurrentUser(currentUser));

      // set token to local storage for axios
      localStorage.setItem('token', result.getIdToken().getJwtToken())

      history.push("/dashboard/check-ins");
    }
  });
}

/**
 * Attempt to log user in automatically if the cognito user is still in local storage
 */
export const refreshCognitoSession = () => (dispatch) => {
  const cognitoUser = getCurrentCognitoUser();
  if (cognitoUser !== null) {
    // Get user session
    cognitoUser.getSession((getSessionError, session) => {
      if (getSessionError) {
        // console.log(getSessionError.message || JSON.stringify(getSessionError));
        toast.error('something occured trying to refresh login');
        return;
      }
      if (session) {


        const refreshToken = session.getRefreshToken();
        const awsCreds: any = AWS.config.credentials;

        // Refresh session if needed
        if (awsCreds !== null && awsCreds.needsRefresh()) {
          cognitoUser.refreshSession(refreshToken, (refreshSessionError, refreshSession) => {
            if (refreshSessionError) {
              console.log(refreshSessionError);
            }
            else {
              awsCreds.params.Logins[`cognito-idp.${environment.awsRegion}.amazonaws.com/${environment.cognitoUserPoolId}`] = refreshSession.getIdToken().getJwtToken();
              const userAttributes = refreshSession.getIdToken().payload;
              const currentUser = {
                email: userAttributes.email,
                roles: userAttributes['cognito:groups'],

              }
              // Set redux cognito data
              dispatch(updateCurrentUser(currentUser));

              // set token to local storage for axios
              localStorage.setItem('token', refreshSession.getIdToken().getJwtToken())
              toast.success('welcome back')
              awsCreds.refresh((refreshTokenError) => {
                if (refreshTokenError) {
                  console.log(refreshTokenError);
                  return true;
                }
                else {
                  return true;
                }
              });
            }
          });
        } else {
          const userAttributes = session.getIdToken().payload;
          const currentUser = {
            email: userAttributes.email,
            roles: userAttributes['cognito:groups'],

          }
          // Set redux cognito data
          dispatch(updateCurrentUser(currentUser));

          // set token to local storage for axios
          localStorage.setItem('token', session.getIdToken().getJwtToken())
        }
        return true;
      } else {
        return false;
      }
    });
  } else {
    return false;
  }
  return true;
}


/**
 * Return current cognito user from session
 */
export const getCurrentCognitoUser = () => {
  const poolData = {
    ClientId: environment.cognitoClientId,
    UserPoolId: environment.cognitoUserPoolId,
  };

  const userPool = new awsCognito.CognitoUserPool(poolData);
  const cognitoUser = userPool.getCurrentUser();
  return cognitoUser;
}



export const updateCurrentUser = (currentUser: ICognitoUser) => {
  return {
    payload: {
      currentUser
    },
    type: authTypes.UPDATE_CURRENT_USER
  }
}

/**
 * Get current login user info from the server
 */
export const setup = () => (dispatch) => {
  refreshCognitoSession()(dispatch);
  window.setInterval(
    () => refreshCognitoSession()(dispatch)
    , 3000000);
}


export const logout = () => {
  localStorage.clear();
  sessionStorage.clear();
  return {
    payload:{},
    type: authTypes.LOGOUT    
  }
}