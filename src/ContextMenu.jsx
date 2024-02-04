import styles from "./ContextMenu.module.css";
/* eslint-disable react/prop-types */

const ContextMenu = ({
  selectedNote,
  positionX,
  positionY,
  isToggled,
  buttons,
  contextMenuRef,
}) => {
  return (
    <menu
      style={{
        top: positionY + 2 + "px",
        left: positionX + 2 + "px",
      }}
      className={isToggled ? styles.contextMenuActive : styles.contextMenu}
      ref={contextMenuRef}
    >
      {buttons.map((button, index) => {
        function handleClick(e) {
          e.stopPropagation();
          button.onClick(e, selectedNote);
        }

        if (button.isSpacer) return <hr key={index}></hr>;

        return (
          <button
            onClick={handleClick}
            key={index}
            className={styles.contextMenuButton}
          >
            <span>{button.text}</span>
            <span className={styles.icon}>{button.icon}</span>
          </button>
        );
      })}
    </menu>
  );
};

export default ContextMenu;
