import React, { useEffect } from 'react'

import AuthUserContext from './context'
import { withFirebase } from '../Firebase'

import history from '../../Helpers/History'

import * as routes from '../../constants/routes'

const withAuthorization = Component => {
  function WithAuthorization(props) {
    useEffect(() => {
      const unsubscribe = props.firebase.auth.onAuthStateChanged(
        authUser => {
          if (!authUser) {
            history.push(routes.home)
          }
        },
        () => history.push(routes.home)
      )

      return () => unsubscribe()
    }, [props])
    return (
      <AuthUserContext.Consumer>
        {authenticated =>
          authenticated === true ? <Component {...props} /> : ''}
      </AuthUserContext.Consumer>
    )
  }

  return withFirebase(WithAuthorization)
}

export default withAuthorization
