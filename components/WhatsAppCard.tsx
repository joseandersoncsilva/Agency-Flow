
import React, { useRef, useState } from 'react';
import { WeeklyReport, Client } from '../types';
import { FORMATTER } from '../constants';
import { 
    TrendingUp, 
    Users, 
    DollarSign, 
    ShoppingBag, 
    Copy, 
    Check, 
    Layers, 
    MousePointerClick, 
    Eye, 
    ArrowDown,
    Target
} from 'lucide-react';
import html2canvas from 'html2canvas';

interface WhatsAppCardProps {
  report: WeeklyReport;
  client: Client;
  id?: string;
}

export const WhatsAppCard: React.FC<WhatsAppCardProps> = ({ report, client, id }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- Calculations ---
  
  // 1. Cost Per Lead
  const cpl = report.leads > 0 ? report.spend / report.leads : 0;
  
  // 2. CTR (Click Through Rate) -> Clicks / Reach
  const ctr = report.reach > 0 ? (report.clicks / report.reach) * 100 : 0;

  // 3. Lead Conversion Rate -> Leads / Clicks
  const leadConversionRate = report.clicks > 0 ? (report.leads / report.clicks) * 100 : 0;

  // 4. Sales Conversion Rate -> Sales / Leads
  const salesConversionRate = report.leads > 0 ? (report.sales / report.leads) * 100 : 0;

  // 5. ROAS -> Revenue / Spend
  const roas = report.spend > 0 && report.revenue ? (report.revenue / report.spend) : 0;
  
  // Format Date Range
  const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
  
  const dateRange = `${formatDate(report.startDate)} a ${formatDate(report.endDate)}`;
  const diffTime = Math.abs(new Date(report.endDate).getTime() - new Date(report.startDate).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const hasChannels = report.channels && report.channels.length > 0;

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    setIsLoading(true);
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null, 
        scale: 2
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
            await navigator.clipboard.write([new ClipboardItem({[blob.type]: blob})]);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            const link = document.createElement('a');
            link.download = `Relatorio-${client.name}-${dateRange}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
      });
    } catch (error) {
      console.error("Failed to generate image", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
        {/* The Wide Card - Funnel Layout */}
        <div 
            ref={cardRef} 
            id={id} 
            className="bg-[#0f172a] p-8 rounded-xl shadow-2xl w-[1000px] text-white border border-slate-700 relative overflow-hidden font-sans"
        >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 right-0 p-64 bg-emerald-600/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-64 bg-blue-600/10 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-center mb-10 relative z-10 border-b border-slate-800 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/50">
                        <span className="text-xl font-bold text-white">{client.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{client.name}</h3>
                        <p className="text-slate-400 text-sm flex items-center gap-2">
                           <Target className="w-3 h-3" /> Relatório de Performance • {dateRange} ({diffDays}d)
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="inline-flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Status Ativo</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10 relative z-10">
                
                {/* LEFT COLUMN: THE FUNNEL (Pyramid) */}
                <div className="col-span-7 flex flex-col items-center relative pt-2">
                    
                    {/* Dashed Connector Line Background */}
                    <div className="absolute top-8 bottom-8 w-0.5 border-l-2 border-dashed border-slate-700/50 left-1/2 -translate-x-1/2 z-0"></div>

                    {/* Stage 1: Reach */}
                    <div className="w-full relative z-10 mb-8 group">
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-xl flex justify-between items-center shadow-lg relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Eye className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Alcance</p>
                                    <p className="text-lg font-bold text-white">{report.reach.toLocaleString('pt-BR')}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500">Pessoas Impactadas</p>
                            </div>
                        </div>
                        
                        {/* Connector Badge */}
                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-20">
                            <div className="bg-slate-900 border border-slate-600 text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                                <ArrowDown className="w-3 h-3 text-blue-400" />
                                CTR {ctr.toFixed(2)}%
                            </div>
                        </div>
                    </div>

                    {/* Stage 2: Clicks */}
                    <div className="w-[85%] relative z-10 mb-8">
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-xl flex justify-between items-center shadow-lg relative overflow-hidden">
                             <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                    <MousePointerClick className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Cliques</p>
                                    <p className="text-lg font-bold text-white">{report.clicks.toLocaleString('pt-BR')}</p>
                                </div>
                            </div>
                        </div>

                         {/* Connector Badge */}
                         <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-20">
                            <div className="bg-slate-900 border border-slate-600 text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                                <ArrowDown className="w-3 h-3 text-indigo-400" />
                                Conv. {leadConversionRate.toFixed(2)}%
                            </div>
                        </div>
                    </div>

                    {/* Stage 3: Leads */}
                    <div className="w-[70%] relative z-10 mb-8">
                         <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900 border border-emerald-500/30 p-4 rounded-xl flex justify-between items-center shadow-lg relative overflow-hidden">
                             <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-emerald-400/80 uppercase font-bold tracking-wider">Leads Gerados</p>
                                    <p className="text-xl font-bold text-emerald-400">{report.leads.toLocaleString('pt-BR')}</p>
                                </div>
                            </div>
                             <div className="text-right">
                                <p className="text-[10px] text-slate-400">CPL</p>
                                <p className="text-sm font-bold text-white">{FORMATTER.format(cpl)}</p>
                            </div>
                        </div>

                        {/* Connector Badge */}
                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-20">
                            <div className="bg-emerald-900 border border-emerald-700 text-emerald-100 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                                <ArrowDown className="w-3 h-3" />
                                Vendas {salesConversionRate.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Stage 4: Sales */}
                    <div className="w-[55%] relative z-10">
                        <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 border border-emerald-400 p-4 rounded-xl flex flex-col items-center justify-center shadow-xl shadow-emerald-900/50 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></div>
                            <ShoppingBag className="w-6 h-6 text-white mb-1" />
                            <p className="text-3xl font-extrabold text-white leading-none">{report.sales}</p>
                            <p className="text-[10px] text-emerald-100 uppercase font-bold tracking-widest mt-1">Vendas Confirmadas</p>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: FINANCIALS & BREAKDOWN */}
                <div className="col-span-5 flex flex-col justify-between h-full">
                    
                    {/* Financial Summary */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 space-y-6 backdrop-blur-sm">
                        
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-slate-400">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Faturamento Total</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-4xl font-extrabold text-white tracking-tight">{FORMATTER.format(report.revenue)}</h2>
                            </div>
                             {roas > 0 && (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                                    <TrendingUp className="w-3 h-3" />
                                    ROAS {roas.toFixed(2)}x
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-slate-700 w-full"></div>

                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold">Investimento</p>
                                <p className="text-xl font-bold text-slate-200">{FORMATTER.format(report.spend)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 uppercase font-bold">Ticket Médio</p>
                                <p className="text-xl font-bold text-slate-200">
                                    {report.sales > 0 ? FORMATTER.format(report.revenue / report.sales) : 'R$ 0,00'}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Breakdown by Platform */}
                    <div className="flex-1 bg-slate-800/30 rounded-2xl p-6 border border-slate-700 mt-6 flex flex-col">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                            <Layers className="w-4 h-4" /> Detalhamento por Canal
                        </h4>
                        
                        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                             {hasChannels ? report.channels.map((ch, idx) => (
                                 ch.spend > 0 && (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <span className="font-bold text-slate-300">{ch.platform.split(' ')[0]}</span>
                                            <div className="text-right">
                                                <span className="text-emerald-400 font-bold ml-2">{ch.leads} Leads</span>
                                            </div>
                                        </div>
                                        
                                        {/* Mini Funnel Bar */}
                                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden flex">
                                            {/* Spend Bar */}
                                            <div 
                                                className={`h-full ${ch.platform.includes('Google') ? 'bg-blue-500' : ch.platform.includes('Meta') ? 'bg-indigo-500' : 'bg-purple-500'}`} 
                                                style={{width: `${(ch.spend / report.spend) * 100}%`}}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[10px] text-slate-500">{FORMATTER.format(ch.spend)}</span>
                                            <span className="text-[10px] text-slate-500">CPL: {ch.leads > 0 ? FORMATTER.format(ch.spend/ch.leads) : '-'}</span>
                                        </div>
                                    </div>
                                 )
                            )) : (
                                <div className="text-center text-slate-500 text-sm py-4 italic">
                                    Dados unificados (Sem quebra de canal)
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Logo */}
                    <div className="mt-6 flex justify-between items-end border-t border-slate-800 pt-4">
                        <div>
                             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Produtos / Serviços</p>
                             <p className="text-xs text-slate-300 mt-1 max-w-[250px] italic">
                                 {report.productsSold || "Nenhum produto especificado"}
                             </p>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-black tracking-tighter text-white">Agency<span className="text-emerald-500">Flow</span></span>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        {/* Action Button */}
        <button 
            onClick={handleCopyImage}
            disabled={isLoading}
            className={`
                flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all shadow-xl transform hover:-translate-y-1
                ${isCopied 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30 ring-2 ring-emerald-500 ring-offset-2' 
                    : 'bg-white text-slate-900 hover:bg-slate-50 shadow-slate-900/10'}
            `}
        >
            {isLoading ? (
                <span className="animate-pulse">Gerando Funil Visual...</span>
            ) : isCopied ? (
                <>
                    <Check className="w-5 h-5" /> Imagem Copiada!
                </>
            ) : (
                <>
                    <Copy className="w-5 h-5" /> Copiar Dashboard
                </>
            )}
        </button>
    </div>
  );
};
