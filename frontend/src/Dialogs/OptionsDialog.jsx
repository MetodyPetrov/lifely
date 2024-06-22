import { useEffect, useRef } from "react";

export default function OptionsDialog({ title, options, optionListeners, children, windowWidth }) {
  const dialog = useRef(null);

  useEffect(() => {
    dialog.current && dialog.current.showModal(); // useEffect must be used, since the first time the children state is changed no dialog exists and thus no dialog for children (Autheticating user) is shown!
  }, [children]);

  return (
    <dialog className="fullscreen-dialog-window" ref={dialog}>
      {options ? (
        <div className="options-dialog-window" style={{ width: windowWidth }}>
          <h1>{title}</h1>

          {options.map((item, index) => (
            <button
              key={index}
              className={
                "dialog-option " +
                (index + 1 !== options.length && "dialog-mid-button")
              }
              onClick={optionListeners[index] || undefined}
            >
              {item}
            </button>
          ))}
        </div>
      ) : (
        { children }
      )}
    </dialog>
  );
}
