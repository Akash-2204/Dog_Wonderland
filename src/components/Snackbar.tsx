import React, { useState, useEffect } from 'react';

interface SnackbarProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!visible || !message) {
    return null;
  }

  const style: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#333',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '4px',
    zIndex: 1000,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  return (
    <div style={style}>
      {message}
    </div>
  );
};

export default Snackbar;
