import React, { useState } from 'react'

import { useDispatch } from 'react-redux'

import Button from '@material-ui/core/Button'
import Group from '@material-ui/icons/Group'
import Paper from '@material-ui/core/Paper'

import { makeStyles } from '@material-ui/core/styles'

import { addUser } from '../../Redux/Actions'

import * as routes from '../../constants/routes'

import history from '../../Helpers/History'

import { withFirebase } from '../Firebase'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2)
  },
  button: {
    margin: theme.spacing(1)
  },
  leftIcon: {
    marginRight: theme.spacing(1)
  }
}))

const SignInGoogle = ({ firebase }) => {
  const classes = useStyles()
  const [errorMessage, setError] = useState('')
  const dispatch = useDispatch()
  const onSubmit = async event => {
    event.preventDefault()

    try {
      const socialAuthUser = await firebase.doSignInWithGoogle()
      await firebase.user(socialAuthUser.user.uid).set({
        username: socialAuthUser.user.displayName,
        email: socialAuthUser.user.email
      })

      setError('')

      dispatch(
        addUser({
          loggedIn: true,
          userName: socialAuthUser.user.displayName,
          userId: socialAuthUser.user.uid
        })
      )

      history.push(routes.about)
    } catch (error) {
      setError({ error })
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Paper className={`${classes.root} center-content`}>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          className={classes.button}
        >
          <Group className={classes.leftIcon}>send</Group>
          Sign In with Google
        </Button>

        {errorMessage && <p>{errorMessage.message}</p>}
      </Paper>
    </form>
  )
}

export default withFirebase(SignInGoogle)