
import React, { useEffect, useState } from 'react';
import { Client, ClientForm, PaymentMethod, Platform, User, UserRole, ServiceProduct } from '../types';
import { X, Save, Trash2, Plus, Minus } from 'lucide-react';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Client) => void;
    onDelete?: (clientId: string) => void;
    clientToEdit?: Client | null;
    users: User[];
    products: ServiceProduct[]; // Pass products to the modal
}

const defaultClientForm: ClientForm = {
    name: '',
    niche: '',
    email: '',
    phone: '',
    businessSummary: '',
    targetAudience: '',
    marketingStrategy: '',
    paymentMethod: PaymentMethod.PIX,
    fee: 0,
    adBudget: 0,
    platforms: [],
    startDate: new Date().toISOString().split('T')[0],
    isActive: true,
    managerId: '',
    csId: '',
    // No explicit products array here, as it's implied by the contracted services.
    // For now, we'll track selected products separately in the form state.
};

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSave, onDelete, clientToEdit, users, products }) => {
    const [form, setForm] = useState<ClientForm>(defaultClientForm);
    const [activeTab, setActiveTab] = useState('dadosGerais');
    const [selectedProducts, setSelectedProducts] = useState<ServiceProduct[]>([]);


    useEffect(() => {
        if (isOpen) {
            if (clientToEdit) {
                setForm({
                    ...clientToEdit,
                    platforms: clientToEdit.platforms || [],
                });
                // Simulate loading contracted products for clientToEdit
                // For now, let's just use a sample of products
                setSelectedProducts(products.filter((_, idx) => idx % 2 === 0)); // Example: client has even-indexed products
            } else {
                setForm(defaultClientForm);
                setSelectedProducts([]);
            }
        }
    }, [isOpen, clientToEdit, products]);

    if (!isOpen) return null;

    const managerUsers = users.filter(u => u.role === UserRole.MANAGER);
    const csUsers = users.filter(u => u.role === UserRole.CS);

    const handlePlatformChange = (platform: Platform, checked: boolean) => {
        setForm(prev => ({
            ...prev,
            platforms: checked
                ? [...(prev.platforms || []), platform]
                : (prev.platforms || []).filter(p => p !== platform),
        }));
    };

    const handleProductToggle = (product: ServiceProduct) => {
        setSelectedProducts(prev => 
            prev.some(p => p.id === product.id)
                ? prev.filter(p => p.id !== product.id)
                : [...prev, product]
        );
    };

    const handleSubmit = () => {
        if (!form.name || !form.niche || !form.startDate || !form.managerId || !form.csId || !form.paymentMethod) {
            alert('Por favor, preencha todos os campos obrigatórios (Nome, Nicho, Data Início, Gestor, CS, Método de Pagamento).');
            return;
        }

        const newClient: Client = {
            id: form.id || Math.random().toString(36).substr(2, 9),
            name: form.name,
            niche: form.niche,
            email: form.email || undefined,
            phone: form.phone || undefined,
            businessSummary: form.businessSummary || undefined,
            targetAudience: form.targetAudience || undefined,
            marketingStrategy: form.marketingStrategy || undefined,
            paymentMethod: form.paymentMethod,
            fee: form.fee,
            adBudget: form.adBudget,
            platforms: form.platforms || [],
            startDate: form.startDate,
            endDate: form.endDate || undefined,
            isActive: form.isActive,
            managerId: form.managerId,
            csId: form.csId,
        };
        onSave(newClient);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-xl sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-slate-800">{clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                    <button onClick={onClose}><X size={20}/></button>
                </div>

                <div className="border-b border-slate-200">
                    <nav className="flex px-6 space-x-4">
                        {['dadosGerais', 'contrato', 'equipe', 'estrategia', 'historico'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-3 px-1 border-b-2 font-bold text-sm capitalize transition-colors
                                    ${activeTab === tab ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                {tab === 'dadosGerais' ? 'Dados Gerais' : tab === 'contrato' ? 'Contrato' : tab === 'equipe' ? 'Equipe' : tab === 'estrategia' ? 'Estratégia' : 'Histórico'}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6 space-y-6">
                    {activeTab === 'dadosGerais' && (
                        <section>
                            <h3 className="text-lg font-bold text-slate-700 mb-3">Informações Básicas</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" className="w-full p-2 border rounded-lg" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nome da Empresa" required />
                                <input type="text" className="w-full p-2 border rounded-lg" value={form.niche} onChange={e => setForm({...form, niche: e.target.value})} placeholder="Nicho de Atuação" required />
                                <input type="email" className="w-full p-2 border rounded-lg" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email de Contato" />
                                <input type="tel" className="w-full p-2 border rounded-lg" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Telefone/WhatsApp" />
                            </div>
                        </section>
                    )}

                    {activeTab === 'contrato' && (
                        <section>
                            <h3 className="text-lg font-bold text-slate-700 mb-3">Detalhes do Contrato</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="number" className="w-full p-2 border rounded-lg" value={form.adBudget} onChange={e => setForm({...form, adBudget: parseFloat(e.target.value)})} placeholder="Verba Mídia/Mês (R$)" min="0" />
                                <select className="w-full p-2 border rounded-lg" value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value as PaymentMethod})}>
                                    {Object.values(PaymentMethod).map(method => <option key={method} value={method}>{method}</option>)}
                                </select>
                                
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Plataformas de Anúncio</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.values(Platform).map(platform => (
                                            <label key={platform} className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={form.platforms.includes(platform)}
                                                    onChange={e => handlePlatformChange(platform, e.target.checked)}
                                                    className="form-checkbox text-emerald-600 rounded"
                                                />
                                                {platform}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <h4 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2"><Plus size={18}/> Produtos Contratados</h4>
                                    <div className="space-y-3">
                                        {products.map(product => (
                                            <label key={product.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.some(p => p.id === product.id)}
                                                    onChange={() => handleProductToggle(product)}
                                                    className="form-checkbox text-emerald-600 rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-800">{product.name}</p>
                                                    <p className="text-xs text-slate-500">{product.description}</p>
                                                </div>
                                                <span className="font-bold text-emerald-600">{`R$ ${product.defaultPrice.toFixed(2).replace('.', ',')}`}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'equipe' && (
                        <section>
                            <h3 className="text-lg font-bold text-slate-700 mb-3">Atribuição de Equipe</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select className="w-full p-2 border rounded-lg" value={form.managerId || ''} onChange={e => setForm({...form, managerId: e.target.value})} required>
                                    <option value="">Gestor de Tráfego...</option>
                                    {managerUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                <select className="w-full p-2 border rounded-lg" value={form.csId || ''} onChange={e => setForm({...form, csId: e.target.value})} required>
                                    <option value="">Customer Success...</option>
                                    {csUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                <div className="col-span-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={form.isActive}
                                        onChange={e => setForm({...form, isActive: e.target.checked})}
                                        className="form-checkbox text-emerald-600 rounded"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Cliente Ativo?</label>
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4 mt-4">
                                <input type="date" className="w-full p-2 border rounded-lg" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} placeholder="Data de Início" required />
                                <input type="date" className="w-full p-2 border rounded-lg" value={form.endDate || ''} onChange={e => setForm({...form, endDate: e.target.value})} placeholder="Data de Término (Opcional)" />
                            </div>
                        </section>
                    )}

                    {activeTab === 'estrategia' && (
                        <section>
                            <h3 className="text-lg font-bold text-slate-700 mb-3">Estratégia e Negócio</h3>
                            <div className="space-y-4">
                                <textarea className="w-full p-2 border rounded-lg h-24" value={form.businessSummary || ''} onChange={e => setForm({...form, businessSummary: e.target.value})} placeholder="Resumo do Negócio (O que a empresa faz/vende)" />
                                <textarea className="w-full p-2 border rounded-lg h-24" value={form.targetAudience || ''} onChange={e => setForm({...form, targetAudience: e.target.value})} placeholder="Público Alvo (Quem queremos atingir?)" />
                                <textarea className="w-full p-2 border rounded-lg h-24" value={form.marketingStrategy || ''} onChange={e => setForm({...form, marketingStrategy: e.target.value})} placeholder="Estratégia de Marketing Atual" />
                            </div>
                        </section>
                    )}

                    {activeTab === 'historico' && (
                        <section>
                            <h3 className="text-lg font-bold text-slate-700 mb-3">Histórico do Cliente</h3>
                            <p className="text-slate-500 italic">Funcionalidade em desenvolvimento...</p>
                            {/* Aqui você listaria relatórios antigos, interações, etc. */}
                        </section>
                    )}
                </div>
                <div className="p-6 border-t bg-slate-50 flex justify-between items-center rounded-b-xl sticky bottom-0 z-10">
                    {clientToEdit ? (
                        <button onClick={() => onDelete && onDelete(clientToEdit.id)} className="text-red-600 font-bold flex items-center gap-2 hover:underline">
                            <Trash2 size={18} /> Excluir Cliente
                        </button>
                    ) : <div></div>}
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">Cancelar</button>
                        <button onClick={handleSubmit} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-2 shadow-md hover:bg-emerald-700 transition-colors">
                            <Save size={18} /> Salvar Cliente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
