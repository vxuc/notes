import styles from "./NoteEditor.module.css";
import StarterKit from "@tiptap/starter-kit";
import { useEditor, EditorContent } from "@tiptap/react";
import PropTypes from "prop-types";

const extensions = [StarterKit];

NoteEditor.propTypes = {
  note: PropTypes.node.isRequired,
  removeNote: PropTypes.node.isRequired,
  onChange: PropTypes.node.isRequired,
};

function NoteEditor({ note, removeNote, onChange }) {
  const editor = useEditor(
    {
      extensions,
      content: note.content,
      editorProps: {
        attributes: {
          class: styles.textEditor,
        },
      },
      onUpdate: ({ editor }) => {
        const editorContent = editor.getJSON();
        onChange(
          editorContent,
          note.title
          // firstNodeContent &&
          //   generateText(firstNodeContent, extensions).substring(0, 7) + "..."
        );
      },
    },
    [note.id]
  );

  const UpdateTitle = () => {
    if (!document.getElementById("title")) return;
    document.getElementById("title").value = note.title;
  };

  let currentNoteId;
  if (currentNoteId != note.id) {
    currentNoteId = note.id;
    UpdateTitle();
  }

  const Updating = () => {
    if (!editor) return;
    const editorContent = editor.getJSON();
    note.title = document.getElementById("title").value;
    onChange(editorContent, note.title);
  };

  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  return (
    <div className={styles.editorContainer}>
      <input
        className={styles.inputField}
        type="text"
        defaultValue={note.title}
        id="title"
        onChange={Updating}
      ></input>
      <div className={styles.toolbar}>
        <button
          className={
            editor?.isActive("bold")
              ? styles.toolbarButtonActive
              : styles.toolbarButton
          }
          onClick={toggleBold}
        >
          <b>B</b>
        </button>

        <button
          className={
            editor?.isActive("italic")
              ? styles.toolbarButtonActive
              : styles.toolbarButton
          }
          onClick={toggleItalic}
        >
          <i>I</i>
        </button>

        <div className={styles.toolbarDelete}>
          <button className={styles.toolbarButton} onClick={removeNote}>
            Search
          </button>
        </div>
      </div>
      <EditorContent editor={editor} className={styles.textEditorContent} />
    </div>
  );
}

export default NoteEditor;
