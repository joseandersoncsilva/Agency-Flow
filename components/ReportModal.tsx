import React, { useEffect, useState, useMemo } from 'react';
import { WeeklyReport, ReportForm, CampaignType, Platform, ChannelResult } from '../types';
import { X, Save, Trash2, Plus, Minus, Layers, DollarSign, Users, MousePointerClick, Eye } from 'lucide-react';
import { FORMATTER } from '../constants';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (report: WeeklyReport) => void;
    onDelete?: (reportId: string) => void;
    reportToEdit?: WeeklyReport | null;
    clientId: string;
}

const defaultReportForm: ReportForm = {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: CampaignType.WHATSAPP,
    channels: [],
    spend: 0,
    reach: 0,
    clicks: 0,
    leads: 0,
    topCreativeLink: '',
    managerNotes: '',
    sales: 0,
    revenue: 0,
    productsSold: '',
    csNotes: '',
};

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSave, onDelete, reportToEdit, clientId }) => {
    const [form, setForm] = useState<ReportForm>(defaultReportForm);

    useEffect(() => {
        if (isOpen) {
            if (reportToEdit) {
                setForm(reportToEdit);
            } else {
                setForm(defaultReportForm);
            }
        }
    }, [isOpen, reportToEdit]);

    // Calculate aggregated metrics whenever channels change
    const aggregatedMetrics = useMemo(() => {
        const totalSpend = form.channels.reduce((sum, c) => sum + c.spend, 0);
        const totalReach = form.channels.reduce((sum, c) => sum + c.reach, 0);
        const totalClicks = form.channels.reduce((sum, c) => sum + c.clicks, 0);
        const totalLeads = form.channels.reduce((sum, c) => sum + c.leads, 0);
        return { totalSpend, totalReach, totalClicks, totalLeads };
    }, [form.channels]);

    useEffect(() => {
        setForm(prev => ({
            ...prev,
            spend: aggregatedMetrics.totalSpend,
            reach: aggregatedMetrics.totalReach,
            clicks: aggregatedMetrics.totalClicks,
            leads: aggregatedMetrics.totalLeads,
        }));
    }, [aggregatedMetrics]);


    if (!isOpen) return null;

    const handleChannelChange = (index: number, field: keyof ChannelResult, value: string | number) => {
        const newChannels = [...form.channels];
        newChannels[index] = {
            ...newChannels[index],
            [field]: typeof value === 'string' && field !== 'platform' ? parseFloat(value || '0') : value,
        };
        setForm({ ...form, channels: newChannels });
    };

    const addChannel = () => {
        setForm({
            ...form,
            channels: [...form.channels, { platform: Platform.META, spend: 0, reach: 0, clicks: 0, leads: 0 }],
        });
    };

    const removeChannel = (index: number) => {
        const newChannels = form.channels.filter((_, i) => i !== index);
        setForm({ ...form, channels: newChannels });
    };

    const handleSubmit = () => {
        if (!form.startDate || !form.endDate || !form.type) {
            alert('Por favor, preencha os campos obrigatórios (Data Início, Data Fim, Tipo de Campanha).');
            return;
        }

        const newReport: WeeklyReport = {
            id: form.id || Math.random().toString(36).substr(2, 9),
            clientId: clientId,
            startDate: form.startDate,
            endDate: form.endDate,
            type: form.type,
            channels: form.channels,
            spend: form.spend,
            reach: form.reach,
            clicks: form.clicks,
            leads: form.leads,
            topCreativeLink: form.topCreativeLink || '',
            managerNotes: form.managerNotes || '',
            sales: form.sales,
            revenue: form.revenue,
            productsSold: form.productsSold || '',
            csNotes: form.csNotes || '',
            createdAt: form.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: form.updatedBy, // will be filled by app component
        };
        onSave(newReport);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-xl sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-slate-800">{reportToEdit ? 'Editar Relatório' : 'Novo Relatório Semanal'}</h2>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <div className="p-6 space-y-6">
                    {/* Basic Report Info */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-700 mb-3">Detalhes Gerais</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="date" className="w-full p-2 border rounded-lg" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required />
                            <input type="date" className="w-full p-2 border rounded-lg" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required />
                            <select className="w-full p-2 border rounded-lg col-span-2" value={form.type} onChange={e => setForm({...form, type: e.target.value as CampaignType})}>
                                {Object.values(CampaignType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                            <input type="url" className="w-full p-2 border rounded-lg col-span-2" value={form.topCreativeLink || ''} onChange={e => setForm({...form, topCreativeLink: e.target.value})} placeholder="Link do Melhor Criativo (Opcional)" />
                        </div>
                    </section>

                    {/* Channel Breakdown */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <Layers size={18}/> Detalhamento por Canais
                        </h3>
                        <div className="space-y-4">
                            {form.channels.map((channel, index) => (
                                <div key={index} className="border p-4 rounded-lg bg-slate-50 relative">
                                    <h4 className="font-bold text-sm mb-3">Canal #{index + 1}</h4>
                                    <button onClick={() => removeChannel(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                                        <Minus size={18}/>
                                    </button>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        <select
                                            className="w-full p-2 border rounded-lg"
                                            value={channel.platform}
                                            onChange={e => handleChannelChange(index, 'platform', e.target.value as Platform)}
                                        >
                                            {Object.values(Platform).map(platform => <option key={platform} value={platform}>{platform}</option>)}
                                        </select>
                                        <input
                                            type="number"
                                            className="w-full p-2 border rounded-lg"
                                            value={channel.spend}
                                            onChange={e => handleChannelChange(index, 'spend', e.target.value)}
                                            placeholder="Gasto (R$)"
                                            min="0"
                                        />
                                        <input
                                            type="number"
                                            className="w-full p-2 border rounded-lg"
                                            value={channel.reach}
                                            onChange={e => handleChannelChange(index, 'reach', e.target.value)}
                                            placeholder="Alcance"
                                            min="0"
                                        />
                                        <input
                                            type="number"
                                            className="w-full p-2 border rounded-lg"
                                            value={channel.clicks}
                                            onChange={e => handleChannelChange(index, 'clicks', e.target.value)}
                                            placeholder="Cliques"
                                            min="0"
                                        />
                                        <input
                                            type="number"
                                            className="w-full p-2 border rounded-lg"
                                            value={channel.leads}
                                            onChange={e => handleChannelChange(index, 'leads', e.target.value)}
                                            placeholder="Leads"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            ))}
                            <button onClick={addChannel} className="w-full py-2 border-2 border-dashed rounded-lg text-slate-400 font-bold hover:bg-slate-100 flex items-center justify-center gap-2">
                                <Plus size={18}/> Adicionar Canal
                            </button>
                        </div>
                    </section>

                    {/* Aggregated Metrics Summary */}
                    <section className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <h3 className="text-lg font-bold text-emerald-700 mb-3">Totais Agregados</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <DollarSign size={20} className="mx-auto text-emerald-600 mb-1" />
                                <p className="text-xs text-emerald-600">Gasto</p>
                                <p className="font-bold text-slate-800">{FORMATTER.format(form.spend)}</p>
                            </div>
                            <div>
                                <Eye size={20} className="mx-auto text-emerald-600 mb-1" />
                                <p className="text-xs text-emerald-600">Alcance</p>
                                <p className="font-bold text-slate-800">{form.reach.toLocaleString('pt-BR')}</p>
                            </div>
                            <div>
                                <MousePointerClick size={20} className="mx-auto text-emerald-600 mb-1" />
                                <p className="text-xs text-emerald-600">Cliques</p>
                                <p className="font-bold text-slate-800">{form.clicks.toLocaleString('pt-BR')}</p>
                            </div>
                            <div>
                                <Users size={20} className="mx-auto text-emerald-600 mb-1" />
                                <p className="text-xs text-emerald-600">Leads</p>
                                <p className="font-bold text-slate-800">{form.leads.toLocaleString('pt-BR')}</p>
                            </div>
                        </div>
                    </section>

                    {/* Manager Notes */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-700 mb-3">Notas do Gestor</h3>
                        <textarea className="w-full p-2 border rounded-lg h-24" value={form.managerNotes || ''} onChange={e => setForm({...form, managerNotes: e.target.value})} placeholder="Observações e estratégias implementadas..." />
                    </section>

                    {/* CS Inputs */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-700 mb-3">Resultados de CS (Vendas)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" className="w-full p-2 border rounded-lg" value={form.sales} onChange={e => setForm({...form, sales: parseInt(e.target.value || '0')})} placeholder="Quantidade de Vendas" min="0" />
                            <input type="number" className="w-full p-2 border rounded-lg" value={form.revenue} onChange={e => setForm({...form, revenue: parseFloat(e.target.value || '0')})} placeholder="Faturamento Total (R$)" min="0" />
                            <input type="text" className="w-full p-2 border rounded-lg col-span-2" value={form.productsSold || ''} onChange={e => setForm({...form, productsSold: e.target.value})} placeholder="Produtos/Serviços Vendidos (ex: 5 Pizzas Grandes, 2 Consultorias)" />
                            <textarea className="w-full p-2 border rounded-lg h-24 col-span-2" value={form.csNotes || ''} onChange={e => setForm({...form, csNotes: e.target.value})} placeholder="Feedback do cliente, próximas ações de relacionamento..." />
                        </div>
                    </section>
                </div>
                <div className="p-6 border-t bg-slate-50 flex justify-between items-center rounded-b-xl sticky bottom-0 z-10">
                    {reportToEdit ? (
                        <button onClick={() => onDelete && onDelete(reportToEdit.id)} className="text-red-600 font-bold flex items-center gap-2 hover:underline">
                            <Trash2 size={18} /> Excluir Relatório
                        </button>
                    ) : <div></div>}
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">Cancelar</button>
                        <button onClick={handleSubmit} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-2 shadow-md hover:bg-emerald-700 transition-colors">
                            <Save size={18} /> Salvar Relatório
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
