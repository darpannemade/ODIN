import React, { useEffect, useState } from 'react';

const alertStyles = {
  container: {
    position: 'fixed',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%) translateY(20px)', // start slightly below
    zIndex: 2147483647,
    minWidth: '250px',
    maxWidth: '350px',
    padding: '16px 24px',
    borderRadius: '12px',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
    color: '#fff',
    fontWeight: 500,
    fontSize: '15px',
    lineHeight: 1.4,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.4s ease-in-out',
    opacity: 0,
    pointerEvents: 'none',
  },
  success: {
    background: 'linear-gradient(135deg, #00c853, #43a047)',
  },
  error: {
    background: 'linear-gradient(135deg, #d50000, #c62828)',
  },
  info: {
    background: 'linear-gradient(135deg, #2962ff, #1e88e5)',
  },
  visible: {
    transform: 'translateX(-50%) translateY(0)',
    opacity: 1,
    pointerEvents: 'auto',
  },
  closeBtn: {
    marginLeft: 'auto',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    lineHeight: 1,
    padding: '0 4px',
    userSelect: 'none',
    transition: 'color 0.3s ease',
  },
  closeBtnHover: {
    color: '#fff',
  },
};

const Alert = ({ message, type = 'success', visible = false, onClose }) => {
  const [show, setShow] = useState(false);
  const [hoverClose, setHoverClose] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  const handleCloseClick = () => {
    setShow(false);
    if (onClose) onClose();
  };

  if (!message || !show) return null;

  const style = {
    ...alertStyles.container,
    ...alertStyles[type],
    ...(show ? alertStyles.visible : {}),
  };

  return (
    <div style={style} role="alert" aria-live="assertive">
      {message}
      <button
        aria-label="Close alert"
        onClick={handleCloseClick}
        onMouseEnter={() => setHoverClose(true)}
        onMouseLeave={() => setHoverClose(false)}
        style={{
          ...alertStyles.closeBtn,
          ...(hoverClose ? alertStyles.closeBtnHover : {}),
        }}
      >
        &times;
      </button>
    </div>
  );
};

export default Alert;
