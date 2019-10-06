import React, { useRef, useState, useEffect } from 'react';
import CN from 'classnames';

const Modal= ({ content, setContent }) => {
  const nodeRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const fadeIn = content;
  const fadeOut = !content;

  useEffect(() => {
    if (content) {
      setVisible(true);
    } else {
      window.setTimeout(() => setVisible(false), 300);
    }
  }, [ content ]);

  return (
    <div
      id='modal'
      className={CN({ visible, fadeIn, fadeOut })}
      ref={nodeRef}
      onClick={e => e.target === nodeRef.current && setContent(null)}
    >
      <div id='modal-inner'>
        <div id='close-modal' onClick={() => setContent(null)}>
          <i className='material-icons'>close</i>
        </div>
        { content }
      </div>
    </div>
  );
}

export default Modal;
