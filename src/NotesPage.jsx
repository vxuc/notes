import styles from "./NotesPage.module.css";
import { useState, useRef, useEffect } from "react";
import { v4 as uuid } from "uuid";
import NoteEditor from "./NoteEditor.jsx";
import debounce from "./debounce.js";
import storage from "./storage.js";
import PropTypes from "prop-types";
import { AES, enc } from "crypto-js";
import ContextMenu from "./ContextMenu.jsx";

const STORAGE_KEY = "notes";

const loadNotes = ({ username, passphrase }) => {
  const noteIds = storage.get(`${username}:${STORAGE_KEY}`, []);
  const notes = {};
  noteIds.forEach((id) => {
    const encryptedNote = storage.get(`${username}:${STORAGE_KEY}:${id}`);
    if (encryptedNote === undefined) {
      return;
    }
    const note = JSON.parse(
      AES.decrypt(encryptedNote, passphrase).toString(enc.Utf8)
    );
    notes[note.id] = {
      ...note,
      updatedAt: new Date(note.updatedAt),
    };
  });
  return notes;
};

// eslint-disable-next-line no-unused-vars
const removeNote = ({ username, passphrase }, note) => {
  storage.remove(`${username}:${STORAGE_KEY}:${note.id}`);
  const noteIds = storage.get(`${username}:${STORAGE_KEY}`, []);
  const noteIdsWithoutNote = noteIds.filter((id) => id !== note.id);
  if (noteIdsWithoutNote.length <= 0) {
    storage.remove(`${username}:${STORAGE_KEY}`);
  } else {
    storage.set(`${username}:${STORAGE_KEY}`, noteIdsWithoutNote);
  }
};

const saveNote = debounce((note, { username, passphrase }) => {
  const noteIds = storage.get(`${username}:${STORAGE_KEY}`, []);
  const noteIdsWithoutNote = noteIds.filter((id) => id !== note.id);
  storage.set(`${username}:${STORAGE_KEY}`, [...noteIdsWithoutNote, note.id]);

  const encryptedNote = AES.encrypt(
    JSON.stringify(note),
    passphrase
  ).toString();
  storage.set(`${username}:${STORAGE_KEY}:${note.id}`, encryptedNote);
}, 200);

NotesPage.propTypes = {
  userData: PropTypes.node.isRequired,
};

function NotesPage({ userData }) {
  const [notes, setNotes] = useState(() => loadNotes(userData));
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    position: {
      x: 0,
      y: 0,
    },
    toggled: false,
  });
  const contextMenuRef = useRef(null);

  const activeNote = activeNoteId ? notes[activeNoteId] : null;

  const handleChangeActiveNote = (id) => {
    setActiveNoteId(id);
  };

  const handleChangeNoteContent = (noteId, content, title) => {
    const updatedNote = {
      ...notes[noteId],
      updatedAt: new Date(),
      content,
      title,
    };

    setNotes((notes) => ({
      ...notes,
      [noteId]: updatedNote,
    }));
    saveNote(updatedNote, userData);
  };

  const handleCreateNewNote = () => {
    const newNote = {
      id: uuid(),
      title: "New note",
      content: "New note",
      updatedAt: new Date(),
    };

    setNotes((notes) => ({
      ...notes,
      [newNote.id]: newNote,
    }));
    setActiveNoteId(newNote.id);
    saveNote(newNote, userData);
  };

  const handleOnContextMenu = (e, selectedNote) => {
    e.preventDefault();

    // const contextMenuAttr = contextMenuRef.current.getBoundingClientRect();
    // const isLeft = e.clientX < window?.innerwidth / 2;

    let x = e.clientX;
    let y = e.clientY;

    setContextMenu({
      position: {
        x,
        y,
      },
      toggled: true,
    });

    setActiveNoteId(selectedNote.id);

    //console.log(selectedNote.id);
  };

  function resetContextMenu() {
    setContextMenu({
      position: {
        x: 0,
        y: 0,
      },
      isToggled: false,
    });
  }

  useEffect(() => {
    function handler(e) {
      if (contextMenuRef.current) {
        if (!contextMenuRef.current.contains(e.target)) {
          resetContextMenu();
        }
      }
    }

    document.addEventListener("click", handler);

    return () => {
      document.removeEventListener("click", handler);
    };
  });

  const deleteNote = (userData, activeNote) => {
    resetContextMenu();
    removeNote(userData, activeNote);
    setNotes(loadNotes(userData));
    setActiveNoteId(
      notesList[0].id === activeNote.id ? notesList[1].id : notesList[0].id
    );
  };

  let notesList = Object.values(notes).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.sidebar}>
        <button className={styles.sidebarButton} onClick={handleCreateNewNote}>
          New Note
        </button>
        <div className={styles.sidebarList}>
          {notesList.map((note) => (
            <div
              key={note.id}
              role="button"
              tabIndex={0}
              className={
                note.id === activeNoteId
                  ? styles.sidebarItemActive
                  : styles.sidebarItem
              }
              onClick={() => handleChangeActiveNote(note.id)}
              onContextMenu={(e) => handleOnContextMenu(e, note)}
            >
              {note.title.substring(0, 12)}
            </div>
          ))}

          <ContextMenu
            contextMenuRef={contextMenuRef}
            isToggled={contextMenu.toggled}
            positionX={contextMenu.position.x}
            positionY={contextMenu.position.y}
            buttons={[
              {
                text: "Delete",
                icon: "❌",
                onClick: () => deleteNote(userData, activeNote),
                isSpacer: false,
              },
            ]}
          ></ContextMenu>
        </div>
      </div>
      {activeNote ? (
        <NoteEditor
          note={activeNote}
          removeNote={() => deleteNote(userData, activeNote)}
          onChange={(content, title) =>
            handleChangeNoteContent(activeNote.id, content, title)
          }
        />
      ) : (
        <div className={styles.empty}>
          Create a new note or select an existing one.
        </div>
      )}
    </div>
  );
}

export default NotesPage;
