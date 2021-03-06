import React, { useState, useEffect, useContext } from 'react'
import { useSelector } from 'react-redux'
import CircularProgress from '@material-ui/core/CircularProgress'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import { makeStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import { Formik, Form, Field } from 'formik'
import { TextField } from 'formik-material-ui'
import * as Yup from 'yup'
import moment from 'moment'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { withFirebase } from '../Firebase'
import SnackbarContext from '../Snackbar/Context'
import MessageListItem from './MessageListItem'

const MessageScheme = Yup.object().shape({
  message: Yup.string().required('Required')
})

const useStyles = makeStyles(theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 'calc(100% - 90px)'
  },
  fab: {
    margin: '14px 8px'
  },
  extendedIcon: {
    marginRight: theme.spacing(1)
  },
  inline: {
    display: 'inline'
  }
}))

const GetMessages = ({ firebase }) => {
  const classes = useStyles()
  const { setSnackbarState } = useContext(SnackbarContext)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const userId = useSelector(state => state.user.userId)

  useEffect(() => {
    try {
      setLoading(true)
      firebase
        .messages(userId)
        .orderByChild('userId')
        .equalTo(userId)
        .on('value', snapshot => {
          const messagesObject = snapshot.val()
          if (messagesObject) {
            const sortedMessages = Object.keys(messagesObject).map(key => ({
              text: messagesObject[key].text,
              date2: messagesObject[key].createdDate,
              date: moment(messagesObject[key].createdDate).format(
                'MM/DD/YYYY'
              ),
              uid: key
            }))

            sortedMessages.sort((a, b) => {
              const dateA = new Date(a.date2)
              const dateB = new Date(b.date2)

              return dateB - dateA
            })

            setMessages(sortedMessages)

            setLoading(false)
          } else {
            setMessages([])
            setLoading(false)
          }
        })
    } catch (error) {
      setLoading(false)
      setSnackbarState({ message: error.message, variant: 'error' })
    }
    return () => {
      firebase
        .messages(userId)
        .orderByChild('userId')
        .equalTo(userId)
        .off('value')
    }
  }, [userId, firebase, setSnackbarState])

  return (
    <div className="messages">
      <Formik
        initialValues={{ message: '' }}
        validationSchema={MessageScheme}
        onSubmit={(values, { setSubmitting, resetForm, initialValues }) => {
          const { message } = values

          firebase
            .messages()
            .push({
              text: message,
              userId,
              createdDate: firebase.firebase().database.ServerValue.TIMESTAMP
            })
            .catch(error => {
              setSnackbarState({ message: error.message, variant: 'error' })
              setSubmitting(false)
            })
          setSubmitting(false)
          resetForm(initialValues)
          setSnackbarState({
            message: 'Message was created!',
            variant: 'success'
          })
        }}
      >
        {({ isSubmitting, isValid }) => (
          <Form>
            <Field
              type="text"
              name="message"
              component={TextField}
              className={classes.textField}
              id="message"
              label="Message"
              variant="outlined"
              margin="normal"
              fullWidth
            />

            <Fab
              type="submit"
              variant="round"
              color="secondary"
              disabled={isSubmitting || !isValid}
              aria-label="add"
              className={classes.fab}
            >
              <AddIcon />
            </Fab>
          </Form>
        )}
      </Formik>
      {loading && <CircularProgress className="message_loading" />}

      <List className={classes.root}>
        <TransitionGroup className="messages_list">
          {messages.map((message, index) => (
            <CSSTransition key={message.uid} timeout={500} classNames="item">
              <div className="message_list_item">
                <MessageListItem message={message} />
                {messages.length !== index + 1 && <Divider component="li" />}
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </List>
    </div>
  )
}

export default withFirebase(GetMessages)
