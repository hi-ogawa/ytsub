import React, { useRef, useState, useEffect } from 'react';
import CN from 'classnames';

import { useGetSelector, useActions } from '../stateDef.js'

const Modal= () => {
  const content = useGetSelector('modal');
  const { setModal } = useActions();

  const nodeRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const fadeIn = content;
  const fadeOut = !content;

  useEffect(() => {
    if (content) {
      setVisible(true);
    } else {
      const timeoutId = window.setTimeout(() => setVisible(false), 300);
      return () => window.clearTimeout(timeoutId);
    }
  }, [ content ]);

  return (
    <div
      id='modal'
      className={CN({ visible, fadeIn, fadeOut })}
      ref={nodeRef}
      onClick={e => e.target === nodeRef.current && setModal(null)}
    >
      <div id='modal-inner'>
        <div id='close-modal' onClick={() => setModal(null)}>
          <i className='material-icons'>close</i>
        </div>
        { content }
      </div>
    </div>
  );
}

export default Modal;
