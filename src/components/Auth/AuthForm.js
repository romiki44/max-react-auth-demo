import { useRef, useState, useContext } from 'react';

import classes from './AuthForm.module.css';
import AuthContext from '../../store/auth-context';
import { useHistory } from 'react-router-dom';

const AuthForm = () => {
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const authCtx = useContext(AuthContext);
  const history = useHistory();

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const submitHandler = (event) => {
    event.preventDefault();
    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;
    const key = 'AIzaSyC8hVtP6sx9XBUqiU8RsZjtwfYCmSQ9JEk';
    let url;

    //optional: add validation
    setIsLoading(true);
    if (isLogin) {
      url =
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
        key;
    } else {
      //register
      url =
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + key;
    }

    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        email: enteredEmail,
        password: enteredPassword,
        returnedSecureToken: true,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        setIsLoading(false);
        if (response.ok) {
          // response.json().then((data) => {
          //   console.log(data);
          // });
          return response.json();
        } else {
          return response.json().then((data) => {
            console.log('auth-error: ', data);
            let errorMessage = 'Authetication failed';
            if (data.error && data.error.message) {
              errorMessage = data.error.message;
            }
            //alert(errorMessage);
            throw new Error(errorMessage);
          });
        }
      })
      .then((data) => {
        console.log('login ok', data);
        authCtx.login(data.idToken);
        history.replace('/');
      })
      .catch((err) => {
        console.log(err.message);
        alert(err.message);
      });
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor='email'>Your Email</label>
          <input type='email' id='email' required ref={emailInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor='password'>Your Password</label>
          <input
            type='password'
            id='password'
            required
            ref={passwordInputRef}
          />
        </div>
        <div className={classes.actions}>
          {!isLoading && (
            <button>{isLogin ? 'Login' : 'Create Account'}</button>
          )}
          {isLoading && <p>Sending request...</p>}
          <button
            type='button'
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? 'Create new account' : 'Login with existing account'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
