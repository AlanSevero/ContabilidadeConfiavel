import React from 'react';
import { LucideIcon, Construction } from 'lucide-react';
import { Button } from './Button';

interface PlaceholderViewProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ 
  title, 
  description, 
  icon: Icon,
  actionLabel,
  onAction 
}) => {
  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-500">{description}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-dashed border-gray-300 text-center">
        <div className="bg-primary-50 p-6 rounded-full mb-6">
          <Icon className="w-12 h-12 text-primary-500" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Módulo em Desenvolvimento</h3>
        <p className="text-gray-500 max-w-md mb-8">
          Estamos trabalhando para trazer as funcionalidades de <strong>{title}</strong> em breve. 
          Esta seção permitirá gerenciar seus dados de forma integrada.
        </p>

        {actionLabel && (
          <Button onClick={onAction || (() => alert('Funcionalidade em breve!'))}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};