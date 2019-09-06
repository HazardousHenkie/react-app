import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { WithAuthorization } from '../../components/Authentication'
import Add from './Add'

const useStyles = makeStyles(() => ({
  title: {
    flexGrow: 1
  }
}))

const Locations = () => {
  const classes = useStyles()

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <div className="About">
          <header className="about_header">
            <Typography variant="h5" component="h2" className={classes.title}>
              My Locations
            </Typography>

            <Add />
          </header>
        </div>
      </Grid>
    </Grid>
  )
}

export default WithAuthorization(Locations)
