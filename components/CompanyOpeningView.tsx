
import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Rocket, CheckCircle2, Building, Users, FileText, ArrowRight, ArrowLeft } from 'lucide-react';

export const CompanyOpeningView: React.FC = () => {
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);

  const steps = [
    { id: 1, title: 'Dados Básicos', icon: Building },
    { id: 2, title: 'Sócios', icon: Users },
    { id: 3, title: 'Atividade (CNAE)', icon: FileText },
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else setCompleted(true);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] animate-fade-in text-center p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Rocket className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Solicitação Enviada!</h2>
        <p className="text-gray-600 max-w-lg mb-8">
          Recebemos seus dados para abertura da empresa. Nossa equipe contábil analisará as informações e entrará em contato em até 24h para coletar as assinaturas digitais.
        </p>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800 mb-8 max-w-md">
            <strong>Próximos Passos:</strong>
            <ul className="list-disc list-inside mt-2 text-left">
                <li>Validação de viabilidade na Junta Comercial</li>
                <li>Emissão do Certificado Digital</li>
                <li>Assinatura do Contrato Social</li>
            </ul>
        </div>
        <Button onClick={() => { setStep(1); setCompleted(false); }}>Voltar ao Início</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Abertura de Empresa Online</h2>
        <p className="text-gray-500">Abra seu CNPJ de forma gratuita e desburocratizada.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-10">
        {steps.map((s, index) => (
          <div key={s.id} className="flex items-center">
            <div className={`flex flex-col items-center relative z-10`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= s.id ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                {step > s.id ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-medium mt-2 absolute -bottom-6 w-32 text-center ${step >= s.id ? 'text-primary-700' : 'text-gray-400'}`}>{s.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-1 w-24 mx-2 rounded ${step > s.id ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-8">
            {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Empresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Nome Fantasia (Opção 1)" placeholder="Ex: Tech Solutions" />
                        <Input label="Nome Fantasia (Opção 2)" placeholder="Alternativa caso o 1º exista" />
                        <Input label="Capital Social Estimado" type="number" placeholder="R$ 10.000,00" />
                        <Input label="Email Corporativo" type="email" />
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium mb-3">Endereço da Sede</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <Input label="CEP" placeholder="00000-000" />
                            <div className="col-span-2"><Input label="Logradouro" /></div>
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quadro Societário</h3>
                    <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm text-blue-700 flex gap-2">
                        <Users className="w-5 h-5 flex-shrink-0" />
                        <p>Você será o Sócio Administrador. Adicione outros sócios se houver.</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Nome Completo do Sócio" />
                            <Input label="CPF" />
                            <Input label="Email" />
                            <Input label="% Participação" type="number" defaultValue="100" />
                        </div>
                    </div>
                    <Button variant="secondary" size="sm" icon={<Users className="w-4 h-4"/>}>Adicionar Outro Sócio</Button>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Econômica</h3>
                    <p className="text-sm text-gray-600 mb-4">Descreva o que sua empresa vai fazer. Nossa IA sugerirá os melhores CNAEs para você pagar menos imposto.</p>
                    <textarea 
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-3 h-32 border"
                        placeholder="Ex: Prestação de serviços de desenvolvimento de software, consultoria em TI e suporte técnico..."
                    ></textarea>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                        <h4 className="text-sm font-bold text-gray-700 mb-2">Regime Tributário Sugerido</h4>
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <CheckCircle2 className="w-5 h-5" />
                            Simples Nacional (Anexo III)
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Baseado na descrição, sua atividade se enquadra no regime simplificado com alíquota inicial de 6%.</p>
                    </div>
                </div>
            )}
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between">
            <Button 
                variant="ghost" 
                onClick={handleBack} 
                disabled={step === 1}
                icon={<ArrowLeft className="w-4 h-4"/>}
            >
                Voltar
            </Button>
            <Button onClick={handleNext} icon={<ArrowRight className="w-4 h-4"/>}>
                {step === 3 ? 'Finalizar Abertura' : 'Próximo Passo'}
            </Button>
        </div>
      </div>
    </div>
  );
};
