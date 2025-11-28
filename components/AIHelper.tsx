import React from 'react';

interface AIHelperProps {
  currentText: string;
  onApply: (text: string) => void;
}

// Component is effectively disabled as API has been removed
export const AIHelper: React.FC<AIHelperProps> = () => {
  return null;
};
