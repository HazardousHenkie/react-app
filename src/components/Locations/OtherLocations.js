import React, { useState, useEffect, useContext } from 'react'
import { useSelector } from 'react-redux'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'

import { CSSTransition, TransitionGroup } from 'react-transition-group'

import { withFirebase } from '../Firebase'
import SnackbarContext from '../Snackbar/Context'
import LocationCard from './LocationCard'

import './Locations.scss'

const useStyles = makeStyles(() => ({
  title: {
    flexGrow: 1,
    margin: '15px 0'
  }
}))

const OtherLocations = ({ firebase }) => {
  const { setSnackbarState } = useContext(SnackbarContext)
  const { userId } = useSelector(state => state.user)
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const classes = useStyles()

  useEffect(() => {
    const unsubscribe = firebase
      .locations()
      .once('value')
      .then(snapshot => {
        if (snapshot.val() !== null) {
          const locationObject = snapshot.val()
          let userName = ''
          let userIdLocation = null

          Object.keys(locationObject).reduce((r, k) => {
            let newLocationObject = []

            if (k !== userId) {
              const unsubscribeUser = firebase
                .user(k)
                .once('value', userSnapshot => {
                  if (userSnapshot.val() !== null) {
                    userIdLocation = userSnapshot.key
                    userName = userSnapshot.val().username
                  }
                })
                .then(() => {
                  newLocationObject = Object.keys(locationObject[k]).map(
                    key => ({
                      userIdLocation,
                      userNameLocation: userName,
                      title: locationObject[k][key].location,
                      image: locationObject[k][key].downloadURL,
                      description: locationObject[k][key].description,
                      id: key
                    })
                  )

                  setLocations(r.concat(newLocationObject).slice(0, 10))
                  setLoading(false)
                })

              return () => unsubscribeUser
            }

            return null
          }, [])
        } else {
          setLocations([])
        }
      })
    return () => unsubscribe
  }, [firebase, setSnackbarState, userId])

  // useEffect(() => {
  //   async function fetchData() {
  //     let locationsArray = []
  //     const unsubscribe = await firebase
  //       .locations()
  //       .once('value', snapshot => {
  //         if (snapshot.val() !== null) {
  //           const locationObject = snapshot.val()
  //           let userName = ''

  //           locationsArray = Object.keys(locationObject).reduce((r, k) => {
  //             let newLocationObject = []

  //             if (k !== userId) {
  //               firebase
  //                 .user(k)
  //                 .once('value', userSnapshot => {
  //                   if (userSnapshot.val() !== null) {
  //                     userName = userSnapshot.val().username
  //                   }
  //                 })
  //                 .then(() => {
  //                   newLocationObject = Object.keys(locationObject[k]).map(
  //                     key => ({
  //                       userNameLocation: userName,
  //                       title: locationObject[k][key].location,
  //                       image: locationObject[k][key].downloadURL,
  //                       description: locationObject[k][key].description,
  //                       id: key
  //                     })
  //                   )

  //                   return r.concat(newLocationObject)
  //                 })

  //               // return r.concat(newLocationObject)
  //             }
  //             console.log(locationsArray)
  //             return locationsArray
  //             // console.log(locationsArray)
  //             // return r.concat(newLocationObject)
  //           }, [])
  //         }

  //         setLoading(false)

  //         // if (locationsArray.length !== 0) {
  //         //   setLocations(locationsArray.slice(0, 10))
  //         // } else {
  //         //   setLocations([])
  //         // }
  //       })
  //       .catch(error => {
  //         setSnackbarState({ message: error, variant: 'error' })
  //       })

  //     return () => unsubscribe
  //   }

  //   fetchData()
  // }, [firebase, setSnackbarState, userId])

  // useEffect(() => {
  //   // we actually don't want to get all locations now but we want to limit it
  //   // unfortunately firebase has some constrains so this is not possible
  //   // so since this is a small application we're splicing it below for now

  //   const unsubscribe = firebase
  //     .locations()
  //     .once('value', snapshot => {
  //       if (snapshot.val() !== null) {
  //         const locationObject = snapshot.val()
  //         let userName = ''
  //         let userIdLocation = null

  //         const locationsArray = Object.keys(locationObject).reduce((r, k) => {
  //           let newLocationObject = []

  //           if (k !== userId) {
  //             firebase
  //               .user(k)
  //               .once('value', userSnapshot => {
  //                 if (userSnapshot.val() !== null) {
  //                   userIdLocation = userSnapshot.key
  //                   userName = userSnapshot.val().username
  //                 }
  //               })
  //               .then(() => {
  //                 newLocationObject = Object.keys(locationObject[k]).map(
  //                   key => ({
  //                     userIdLocation,
  //                     userNameLocation: userName,
  //                     title: locationObject[k][key].location,
  //                     image: locationObject[k][key].downloadURL,
  //                     description: locationObject[k][key].description,
  //                     id: key
  //                   })
  //                 )
  //               })
  //           }

  //           return r.concat(newLocationObject)
  //         }, [])

  //         setLocations(locationsArray.slice(0, 10))
  //       } else {
  //         setLocations([])
  //       }

  //       setLoading(false)
  //     })
  //     .catch(error => {
  //       setSnackbarState({ message: error, variant: 'error' })
  //     })

  //   return () => unsubscribe
  // }, [firebase, setSnackbarState, userId])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <div className="locations">
          <header className="locations__header">
            <Typography variant="h5" component="h2" className={classes.title}>
              Where to next? Check where other people have been!
            </Typography>
          </header>
        </div>

        {loading && <CircularProgress className="messageLoading" />}

        {locations && (
          <TransitionGroup component={Grid} container spacing={2}>
            {locations.map(location => (
              <CSSTransition key={location.id} timeout={500} classNames="item">
                <LocationCard location={location} key={location.id} />
              </CSSTransition>
            ))}
          </TransitionGroup>
        )}
      </Grid>
    </Grid>
  )
}

export default withFirebase(OtherLocations)
