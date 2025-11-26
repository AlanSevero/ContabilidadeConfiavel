import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { enhanceDescription } from '../services/geminiService';
import { Button } from './Button';

interface AIHelperProps {
  currentText: string;
  onApply: (text: string) => void;
}

export const AIHelper: React.FC<AIHelperProps> = ({ currentText, onApply }) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!currentText) return;
    setLoading(true);
    const result = await enhanceDescription(currentText);
    setSuggestion(result);
    setLoading(false);
  };

  const handleApply = () => {
    if (suggestion) {
      onApply(suggestion);
      setSuggestion(null);
    }
  };

  return (
    <div className="mt-2">
      {!suggestion ? (
        <Button 
          type="button" 
          variant="secondary" 
          size="sm" 
          onClick={handleEnhance} 
          disabled={loading || !currentText}
          className="text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Melhorar com IA
        </Button>
      ) : (
        <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3 mt-2 animate-fade-in">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-900 mb-1">Sugestão da IA:</p>
              <p className="text-sm text-indigo-700 italic">"{suggestion}"</p>
              <div className="flex gap-2 mt-3">
                <Button type="button" size="sm" onClick={handleApply}>Aplicar</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setSuggestion(null)}>Descartar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};