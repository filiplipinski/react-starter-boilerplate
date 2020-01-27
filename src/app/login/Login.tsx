import React, { createRef, FormEvent, useState } from 'react';
import { Redirect } from 'react-router-dom';

import { useAuthDispatch, useAuthState } from 'hooks';
import { setAuthorized, setTokens, startAuthorizing } from 'context/auth/authActionCreators/authActionCreators';
import { authStorage } from 'context/auth/authStorage/AuthStorage';

import { AppRoute } from '../routes/AppRoute.enum';
import { LoginProps } from './Login.types';

/*
 * TODO:
 *   - create re-usable Input/Button components and replace inputs and/or button with them
 *     you can use React.forwardRef in order to pass reference to the proper element
 *     https://pl.reactjs.org/docs/forwarding-refs.html
 * */

export const Login: React.FC<LoginProps> = ({ fetchCurrentUser, onSubmit }) => {
  const username = createRef<HTMLInputElement>();
  const password = createRef<HTMLInputElement>();

  const { isAuthorized, isAuthorizing } = useAuthState();
  const dispatch = useAuthDispatch();
  const [error, setError] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    const body = {
      username: username.current?.value,
      password: password.current?.value,
    };

    e.preventDefault();
    e.currentTarget.reset();

    dispatch(startAuthorizing());

    const { payload, error: submitError } = await onSubmit(body);

    if (!submitError && payload) {
      const { payload: currentUser, error: fetchError } = await fetchCurrentUser;

      if (!fetchError && currentUser) {
        const { accessToken, refreshToken } = payload;

        authStorage.accessToken = accessToken;
        authStorage.refreshToken = refreshToken;

        dispatch(setTokens(accessToken, refreshToken));
        dispatch(setAuthorized(currentUser));
      }

      if (fetchError) {
        setError(true);
      }
    }

    if (submitError) {
      setError(true);
    }
  }

  if (isAuthorized) {
    return <Redirect to={AppRoute.home} />;
  }

  return (
    <>
      <h2>Login</h2>
      {error && <div>Invalid username and/or password</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            username:
            <input ref={username} />
          </label>
        </div>
        <div>
          <label>
            password:
            <input type="password" ref={password} />
          </label>
        </div>
        <button type="submit" disabled={isAuthorizing}>
          submit
        </button>
      </form>
    </>
  );
};