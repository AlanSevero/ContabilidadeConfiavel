
import React, { useState, useEffect } from 'react';
import { Employee, Accountant } from '../types';
import { getEmployees, saveEmployee, deleteEmployee, getAssignedAccountant } from '../services/storageService';
import { Button } from './Button';
import { Input } from './Input';
import { UsersRound, Plus, Trash2, Edit, Save, DollarSign, Download, CalendarCheck } from 'lucide-react';

export const PayrollView: React.FC<{ userId: string }> = ({ userId }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [payrollProcessed, setPayrollProcessed] = useState(false);

  useEffect(() => {
    setEmployees(getEmployees(userId));
  }, [userId]);

  const handleEdit = (employee?: Employee) => {
    if (employee) {
        setCurrentEmployee(employee);
    } else {
        setCurrentEmployee({
            id: crypto.randomUUID(),
            userId,
            name: '',
            role: '',
            salary: 1412.00,
            admissionDate: new Date().toISOString().split('T')[0],
            status: 'active'
        });
    }
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentEmployee) {
        saveEmployee(currentEmployee);
        setEmployees(getEmployees(userId));
        setIsEditing(false);
        setCurrentEmployee(null);
    }
  };

  const handleDelete = (id: string) => {
    if(confirm('Remover funcionário?')) {
        deleteEmployee(id);
        setEmployees(getEmployees(userId));
    }
  }

  const handleProcessPayroll = () => {
    if (employees.length === 0) return;
    setPayrollProcessed(true);
  };

  if (isEditing && currentEmployee) {
      return (
          <div className="max-w-2xl mx-auto animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">{employees.find(e => e.id === currentEmployee.id) ? 'Editar Funcionário' : 'Admissão de Funcionário'}</h2>
              <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                  <Input label="Nome Completo" value={currentEmployee.name} onChange={e => setCurrentEmployee({...currentEmployee, name: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-4">
                      <Input label="Cargo" value={currentEmployee.role} onChange={e => setCurrentEmployee({...currentEmployee, role: e.target.value})} required />
                      <Input label="Salário Bruto (R$)" type="number" step="0.01" value={currentEmployee.salary} onChange={e => setCurrentEmployee({...currentEmployee, salary: parseFloat(e.target.value)})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <Input label="Data de Admissão" type="date" value={currentEmployee.admissionDate} onChange={e => setCurrentEmployee({...currentEmployee, admissionDate: e.target.value})} required />
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select 
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                            value={currentEmployee.status}
                            onChange={e => setCurrentEmployee({...currentEmployee, status: e.target.value as any})}
                          >
                              <option value="active">Ativo</option>
                              <option value="vacation">Férias</option>
                              <option value="terminated">Desligado</option>
                          </select>
                      </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
                      <Button type="submit" icon={<Save className="w-4 h-4"/>}>Salvar</Button>
                  </div>
              </form>
          </div>
      )
  }

  const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
  const totalFGTS = totalSalary * 0.08;
  const totalINSS = totalSalary * 0.11; // Simplified estimate

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Folha de Pagamento</h2>
          <p className="text-gray-500">Gestão de funcionários, holerites e encargos.</p>
        </div>
        <Button onClick={() => handleEdit()} icon={<Plus className="w-4 h-4" />}>
          Admitir Funcionário
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee List */}
          <div className="lg:col-span-2 space-y-4">
              {employees.length === 0 ? (
                  <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                      <UsersRound className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum funcionário cadastrado.</p>
                  </div>
              ) : (
                  employees.map(emp => (
                      <div key={emp.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                  {emp.name.charAt(0)}
                              </div>
                              <div>
                                  <h4 className="font-bold text-gray-900">{emp.name}</h4>
                                  <p className="text-xs text-gray-500">{emp.role} • Admissão: {new Date(emp.admissionDate).toLocaleDateString()}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-4">
                              <div className="text-right hidden sm:block">
                                  <p className="text-sm font-bold text-gray-900">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(emp.salary)}</p>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                      {emp.status === 'active' ? 'Ativo' : emp.status}
                                  </span>
                              </div>
                              <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => handleEdit(emp)}><Edit className="w-4 h-4"/></Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleDelete(emp.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></Button>
                              </div>
                          </div>
                      </div>
                  ))
              )}
          </div>

          {/* Payroll Actions */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-primary-600" />
                  Competência Atual
              </h3>
              
              <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between">
                      <span className="text-gray-600">Funcionários Ativos:</span>
                      <span className="font-medium">{employees.length}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-gray-600">Total Salários:</span>
                      <span className="font-medium">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(totalSalary)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                      <span>Estimativa FGTS (8%):</span>
                      <span>{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(totalFGTS)}</span>
                  </div>
              </div>

              {!payrollProcessed ? (
                  <Button 
                    className="w-full" 
                    onClick={handleProcessPayroll} 
                    disabled={employees.length === 0}
                    icon={<DollarSign className="w-4 h-4" />}
                  >
                      Processar Folha
                  </Button>
              ) : (
                  <div className="space-y-3 animate-slide-up">
                      <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm text-center font-medium mb-4">
                          Folha Processada com Sucesso!
                      </div>
                      <Button variant="secondary" className="w-full justify-start" icon={<Download className="w-4 h-4"/>}>
                          Baixar Holerites (ZIP)
                      </Button>
                      <Button variant="secondary" className="w-full justify-start" icon={<Download className="w-4 h-4"/>}>
                          Baixar Guia FGTS
                      </Button>
                      <Button variant="secondary" className="w-full justify-start" icon={<Download className="w-4 h-4"/>}>
                          Baixar Guia INSS (GPS)
                      </Button>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
