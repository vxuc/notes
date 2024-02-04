import LoginPage from "./LoginPage.jsx";
import NotesPage from "./NotesPage.jsx";
import { useState } from "react";

function App() {
  const [userData, setUserData] = useState();

  return userData ? (
    <NotesPage userData={userData} />
  ) : (
    <LoginPage setUserData={setUserData} />
  );
}

export default App;
