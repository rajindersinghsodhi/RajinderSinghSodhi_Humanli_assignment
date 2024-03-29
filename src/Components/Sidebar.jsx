import React, { useContext, useState } from "react";
import "./Sidebar.scss";
import Chats from "./Chats";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "../Context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import SearchIcon from '@mui/icons-material/Search';

function Sidebar() {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]); 
  const [err, setErr] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const handleKey = (e) => {
    e.code === "Enter" && handleSearch();
  };

  const handleSearch = async () => {
    const q = query(
      collection(db, "users"),
      where("displayName", "==", username)
    );

    try {
      const querySnapshot = await getDocs(q);
      const foundUsers = [];
      querySnapshot.forEach((doc) => {
        foundUsers.push(doc.data());
      });
      setUsers(foundUsers);
      setErr(false); 
    } catch (err) {
      console.error("Error searching for users:", err);
      setErr(true);
    }
  };



  const handleSelect = async (selectedUser) => {
    const combineId =
      currentUser.uid > selectedUser.uid
        ? currentUser.uid + selectedUser.uid
        : selectedUser.uid + currentUser.uid;

    try {
      const chatRef = doc(db, "chats", combineId);
      const chatSnapshot = await getDoc(chatRef);

      if (!chatSnapshot.exists()) {
        await setDoc(chatRef, { messages: [] });

        const currentUserChatRef = doc(db, "userChats", currentUser.uid);
        const selectedUserChatRef = doc(db, "userChats", selectedUser.uid);

        const currentUserChatData = {
          [combineId + ".userInfo"]: {
            uid: selectedUser.uid,
            displayName: selectedUser.displayName,
            photoURL: selectedUser.photoURL,
          },
          [combineId + ".date"]: serverTimestamp(),
        };

        const selectedUserChatData = {
          [combineId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combineId + ".date"]: serverTimestamp(),
        };

        await Promise.all([
          updateDoc(currentUserChatRef, currentUserChatData),
          updateDoc(selectedUserChatRef, selectedUserChatData),
        ]);
      }
    } catch (err) {
      console.error("Error selecting user:", err);
    }

    setUsername("");
    setUsers([]);
  };

  return (
    <div className="sidebar__home">
      <header className="header__sidebar">
        <div className="user__information">
          <img src={currentUser.photoURL} alt="" />
          <span>{currentUser.displayName}</span>
          <LogoutIcon onClick={() => signOut(auth)}/>
        </div>
      </header>
      <div className="content__container">
      <div className="container__sidebar">
        <div className="search__input">
          <SearchIcon/>
          <input
            type="text"
            placeholder="Search a user"
            onKeyDown={handleKey}
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
        </div>
        <div className="search__result">
          {err && <span>User not found</span>}
          {users.length > 0 &&
            users.map((user) => (
              <div
                className="userChat"
                key={user.uid}
                onClick={() => handleSelect(user)}
              >
                <img src={user.photoURL} alt="" />
                <div className="userChatInfo">
                  <span>{user.displayName}</span>
                  <PersonAddOutlinedIcon/>
                </div>
              </div>
            ))}
          </div>
      </div>
      <div className="chats__container">
          <Chats />
      </div>
      </div>
    </div>
  );
}

export default Sidebar;
