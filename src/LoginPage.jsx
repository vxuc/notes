import styles from "./LoginPage.module.css";
import { useState } from "react";
import { AES, enc } from "crypto-js";
import storage from "./storage";
import { v4 as uuid } from "uuid";
import PropTypes from "prop-types";

const PASSPHRASE_STORAGE_KEY = "passphrase";

LoginPage.propTypes = {
  setUserData: PropTypes.node.isRequired,
};

function LoginPage({ setUserData }) {
  const [username, setUsername] = useState("jordan");
  const [password, setPassword] = useState("jordan");
  const [errorText, setErrorText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const encryptedPassphrase = storage.get(
      `${username}:${PASSPHRASE_STORAGE_KEY}`
    );
    if (!encryptedPassphrase) {
      const passphrase = uuid();
      storage.set(
        `${username}:${PASSPHRASE_STORAGE_KEY}`,
        AES.encrypt(passphrase, password).toString()
      );
      setUserData({ username, passphrase });
      return;
    }

    const passphrase = AES.decrypt(encryptedPassphrase, password).toString(
      enc.Utf8
    );

    if (passphrase) {
      setUserData({ username, passphrase });
    } else {
      setErrorText("Invalid credentials for existing user");
    }
  };

  const handleChangeUsername = (e) => {
    setUsername(e.target.value);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  return (
    <div className={styles.pageContainer}>
      <form className={styles.loginContainer} onSubmit={handleSubmit}>
        {errorText}
        <label>
          <div className={styles.labelText}>Username</div>
          <input
            name="username"
            type="text"
            className={styles.textField}
            onChange={handleChangeUsername}
            value={username}
          />
        </label>
        <label>
          <div className={styles.labelText}>Password</div>
          <input
            name="password"
            type="password"
            className={styles.textField}
            onChange={handleChangePassword}
            value={password}
          />
        </label>
        <div>
          <button type="submit" className={styles.button}>
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
export default LoginPage;
