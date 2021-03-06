import React, { useContext, useEffect, useState } from 'react'
import { compose } from 'recompose'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Chip from '@material-ui/core/Chip'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'

import { WithAuthorization } from '../../components/Authentication'
import SnackbarContext from '../../components/Snackbar/Context'
import { withFirebase } from '../../components/Firebase'

import history from '../../Helpers/History'

import * as routes from '../../constants/routes'

const useStyles = makeStyles(theme => ({
  rootPaper: {
    padding: theme.spacing(3, 2)
  },
  title: {
    flexGrow: 1
  },
  text: {
    marginTop: '20px',
    marginBottom: '15px'
  },
  image: {
    maxWidth: '100%'
  },
  chip: {
    margin: theme.spacing(1)
  }
}))

const Profile = ({ firebase, match }) => {
  const classes = useStyles()
  const [user, setUser] = useState({})
  const { setSnackbarState } = useContext(SnackbarContext)

  useEffect(() => {
    firebase
      .user(match.params.id)
      .once('value', snapshot => {
        if (snapshot.val() !== null) {
          setUser({
            name: snapshot.val().username,
            image: snapshot.val().downloadURL,
            description: snapshot.val().description,
            countries: snapshot.val().countries
          })
        } else {
          history.push(routes.home)
        }
      })
      .catch(removeError => {
        setSnackbarState({ message: removeError.message, variant: 'error' })
      })
  }, [firebase, setSnackbarState, match])

  const { image, name, description, countries } = user

  return (
    <div className="profile">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <header className="profile__header">
            <Typography variant="h5" component="h2" className={classes.title}>
              Profile
            </Typography>
          </header>
        </Grid>
      </Grid>
      <Paper className={`${classes.rootPaper} center-content`}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h5" component="h2" className={classes.title}>
              {name}
            </Typography>
            <Box className={classes.text} textAlign="center">
              {description}
            </Box>

            {countries && (
              <div className="countries">
                <Typography
                  variant="h6"
                  component="h3"
                  className={classes.title}
                >
                  Visited countries:
                </Typography>

                <div className="countries__chips">
                  {countries.map(country => (
                    <Chip
                      label={country.label}
                      key={country.label}
                      className={classes.chip}
                    />
                  ))}
                </div>
              </div>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <img
              className={classes.image}
              src={image}
              alt={name}
              title={name}
            />
          </Grid>
        </Grid>
      </Paper>
    </div>
  )
}

export default compose(
  withFirebase,
  WithAuthorization
)(Profile)
