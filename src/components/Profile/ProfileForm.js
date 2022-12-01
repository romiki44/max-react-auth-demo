import { useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import AuthContext from '../../store/auth-context';
import classes from './ProfileForm.module.css';

const ProfileForm = () => {
  const newPaswordInputRef = useRef();
  const authCtx = useContext(AuthContext);
  const history = useHistory();

  const submitHandler = (event) => {
    event.preventDefault();
    const enteredNewPassword = newPaswordInputRef.current.value;
    const key = 'AIzaSyC8hVtP6sx9XBUqiU8RsZjtwfYCmSQ9JEk';
    const url =
      'https://identitytoolkit.googleapis.com/v1/accounts:update?key=' + key;

    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        idToken: authCtx.token,
        password: enteredNewPassword,
        returnSecureToken: false,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then((data) => {
            let errMessage = 'Password change failed';
            if (data.error && data.error.message) {
              errMessage = data.error.message;
            }
            throw new Error(errMessage);
          });
        }
      })
      .then((data) => {
        console.log('password changed ok', data);
        history.replace('/');
      })
      .catch((err) => {
        console.log(err.message);
        alert(err.message);
      });
  };

  return (
    <form className={classes.form} onSubmit={submitHandler}>
      <div className={classes.control}>
        <label htmlFor='new-password'>New Password</label>
        <input type='password' id='new-password' ref={newPaswordInputRef} />
      </div>
      <div className={classes.action}>
        <button>Change Password</button>
      </div>
    </form>
  );
};

export default ProfileForm;
