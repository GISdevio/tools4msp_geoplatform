import React, { createContext, useContext, useRef } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

export const TriggerContext = createContext(null);


function Trigger({ placement = 'top', children, content }) {
  const ctx = useContext(TriggerContext);
  const renderTooltip = (props) => (
    <Tooltip {...props}>
      {content}
    </Tooltip>
  );

  if (!ctx.current) {
    return children;
  }

  return (
    <OverlayTrigger
      placement={placement}
      overlay={renderTooltip}
      container={ctx.current}
    >
      <span>{children}</span>
    </OverlayTrigger>
  );
}


export function TriggerContainer({ children }) {
  const ref = useRef(null);

  return (
    <>
      <TriggerContext.Provider value={ref}>
        {children}
      </TriggerContext.Provider>
      <div ref={ref} id="app-container"></div>
    </>
  )
}

export default Trigger;