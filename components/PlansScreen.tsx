import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { PlanTier } from '../types';
import { saveUserPlan, getUserPlan } from '../services/storageService';
import { getCurrentUser } from '../services/authService';

export const PlansScreen: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('basico');
  const user = getCurrentUser();

  useEffect(() => {
    if (user) {
      setCurrentPlan(getUserPlan(user.id));
    }
  }, [user]);

  const handleSelectPlan = (plan: PlanTier) => {
    if (user) {
      saveUserPlan(user.id, plan);
      setCurrentPlan(plan);
      alert(`Plano ${plan.toUpperCase()} selecionado com sucesso!`);
    }
  };

  const plans = [
    {
      id: 'basico',
      name: 'BASICO',
      price: '120',
      color: 'bg-[#1e3a8a]', // Dark Blue
      features: [
        { name: 'Funcionalidade Basica', included: true },
        { name: 'Funcionarios', included: false },
        { name: 'Marketing', included: false },
        { name: 'Atendimento 24hrs', included: false },
      ]
    },
    {
      id: 'standard',
      name: 'STANDARD',
      price: '150',
      color: 'bg-[#0ea5e9]', // Sky Blue (Highlighted)
      scale: true,
      features: [
        { name: 'Funcionalidade Basica', included: true },
        { name: 'Funcionarios', included: true },
        { name: 'Marketing', included: false },
        { name: 'Atendimento 24hrs', included: false },
      ]
    },
    {
      id: 'premium',
      name: 'PREMIUM',
      price: '350',
      color: 'bg-[#2dd4bf]', // Teal
      features: [
        { name: 'Funcionalidade Basica', included: true },
        { name: 'Funcionarios', included: true },
        { name: 'Marketing', included: true },
        { name: 'Atendimento 24hrs', included: false },
      ]
    },
    {
      id: 'diamante',
      name: 'DIAMANTE',
      price: '400',
      color: 'bg-[#3b82f6]', // Royal Blue
      features: [
        { name: 'Funcionalidade Basica', included: true },
        { name: 'Funcionarios', included: true },
        { name: 'Marketing', included: true },
        { name: 'Atendimento 24hrs', included: true },
      ]
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] py-10 animate-fade-in relative">
      <div className="absolute top-0 left-0 p-4">
        <button className="text-primary-600 hover:text-primary-800 transition-colors">
            {/* Back arrow placeholder if needed, though sidebar handles nav */}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end max-w-7xl mx-auto w-full px-4">
        {plans.map((plan) => {
            const isSelected = currentPlan === plan.id;
            const isStandard = plan.id === 'standard';
            
            return (
                <div 
                  key={plan.id}
                  className={`relative flex flex-col ${isStandard ? 'lg:-mt-8 lg:mb-4 z-10 shadow-2xl scale-105' : 'shadow-lg'} 
                  ${isSelected ? 'ring-4 ring-offset-4 ring-green-400' : ''} 
                  transition-all duration-300 rounded-2xl overflow-hidden bg-white h-full`}
                >
                    {/* Header */}
                    <div className={`${plan.color} py-6 text-center`}>
                        <div className="bg-white inline-block px-8 py-2 rounded-full shadow-sm">
                            <span className={`font-bold uppercase tracking-widest ${plan.color.replace('bg-', 'text-')}`}>
                                {plan.name}
                            </span>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="bg-[#2a6f97] p-1 space-y-[1px]"> 
                        {/* Using small gaps or borders to create the "table row" look from the image if needed, 
                            but keeping it clean with alternating backgrounds or simple list */}
                        {plan.features.map((feature, idx) => (
                             <div key={idx} className="bg-[#1f618d] text-white px-4 py-2 text-xs font-bold uppercase flex items-center justify-between border-b border-white/10 last:border-0">
                                <span className="flex-1 text-center">{feature.name}</span>
                                {feature.included ? (
                                    <Check className="w-4 h-4 text-white ml-1" /> // In image it's just text, usually check
                                ) : (
                                    <X className="w-4 h-4 text-red-500 ml-1 font-bold" />
                                )}
                             </div>
                        ))}
                    </div>
                    {/* The image shows the blue background continuing down for features. 
                        Let's adjust to match the reference image's specific blocky style more closely. */}
                     <div className="flex-1 flex flex-col">
                        {plan.features.map((feature, idx) => (
                           <div key={idx} className={`py-3 px-2 flex items-center justify-center text-xs font-bold text-white uppercase border-b border-white/20 ${plan.color}`}>
                               {/* Mimicking the strikethrough or X mark visually */}
                               <div className="relative">
                                  {feature.name}
                                  {!feature.included && (
                                     <X className="absolute -left-4 top-0 bottom-0 my-auto w-4 h-4 text-red-600 stroke-[4]" />
                                  )}
                               </div>
                           </div>
                        ))}
                     </div>

                    {/* Price & Action */}
                    <div className={`${plan.color} p-6 flex flex-col items-center justify-center mt-auto`}>
                        <div className="text-white mb-4 text-center">
                            <span className="text-2xl font-bold">R$ {plan.price}</span>
                        </div>
                        <button 
                            onClick={() => handleSelectPlan(plan.id as PlanTier)}
                            className="bg-white text-gray-800 font-bold py-2 px-8 rounded shadow-md hover:bg-gray-50 transition-colors uppercase text-sm"
                        >
                            {isSelected ? 'SEU PLANO' : 'ASSINE'}
                        </button>
                    </div>
                </div>
            );
        })}
      </div>

      <div className="mt-12 flex flex-col items-center">
         <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl font-bold text-[#0ea5e9]">∞</span>
            <div className="flex flex-col">
               <span className="text-sm font-bold text-[#0ea5e9] leading-none">Contabilidade</span>
               <span className="text-sm font-bold text-[#0369a1] leading-none">Confiável</span>
            </div>
         </div>
      </div>
      
      {/* Decorative Wave at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-32 -z-10 pointer-events-none">
         <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full preserve-aspect-ratio-none">
            <path fill="#0ea5e9" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
         </svg>
      </div>
    </div>
  );
};