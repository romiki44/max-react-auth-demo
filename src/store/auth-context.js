import React, { useEffect, useState } from 'react';

let logoutTimer;

const AuthContext = React.createContext({
  token: '',
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

const calculateRemainingTime = (expirationTime) => {
  const currentTime = new Date().getTime(); //aktualny cas v milisekundach
  const adjExpirationTime = new Date(expirationTime).getTime(); //cas platnosti tokenu v ms
  return adjExpirationTime - currentTime; //doba trvania platnosti tokenu v ms
};

//toto kvoli tomu, ze abz sme sa automaticky odhlasili, ked uplynie platnost tokenu
//kedze ukladame token aj expirationTime do LocalStorage, treba to nacitat a nastavit ak je cas este platny
//kvoli tomu aj ten useEffect....proste kopec roboty....proste blbosticky :)
const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem('token');
  const storedExiprationTime = localStorage.getItem('expirationTime');
  const remainingTime = calculateRemainingTime(storedExiprationTime);
  //ak zostava menej ako 15s, tak ho uz neprihlasime...15*1000ms...len priklad
  if (remainingTime <= 15000) {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationTime');
    return null;
  }
  //token je platny
  return {
    token: storedToken,
    duration: remainingTime,
  };
};

export const AuthContextProvider = (props) => {
  //bezi len raz, pri psusteni programu!! (alebo refreshu, reloade stranky)
  const tokenData = retrieveStoredToken();
  let initialToken = null;
  if (tokenData) {
    initialToken = tokenData.token;
  }
  //const initialToken = localStorage.getItem('token');
  //netreba useEffect, pretoze localStorage.getItem()/setItem() je sync api!!
  const [token, setToken] = useState(initialToken);

  const userIsLoggedIn = !!token;

  const logoutHandler = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('expirationTime');

    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  };

  const loginHandler = (token, expirationTime) => {
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('expirationTime', expirationTime); //time musi byt string!

    //automaticke odhlasenie v apke podla doby trvania platnosti tokenu
    let remainingTime = calculateRemainingTime(expirationTime);
    //remainingTime = 3000; //test!
    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  useEffect(() => {
    if (tokenData) {
      console.log(tokenData.duration); // sa zmensuje, az k nule!
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData]);

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
