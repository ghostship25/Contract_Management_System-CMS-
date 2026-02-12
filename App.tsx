
import React, { useState, useEffect, useMemo } from 'react';
import { Contract, ViewState } from './types';
import { INITIAL_CONTRACT } from './constants';
import { ContractForm } from './components/ContractForm';
import { DashboardCharts } from './components/DashboardCharts';
import { LetterCenter } from './components/LetterCenter';
import { 
  Plus, 
  FileText, 
  Search, 
  Trash2, 
  Edit, 
  Download, 
  Upload, 
  Database,
  BarChart3,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Printer,
  ChevronLeft,
  Filter,
  FilePlus2
} from 'lucide-react';

const STORAGE_KEY = 'nepal_gov_contracts_v2_data';

const App: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [printId, setPrintId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced Filters
  const [filterWard, setFilterWard] = useState<string>('');
  const [filterFY, setFilterFY] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setContracts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
  }, [contracts]);

  const handleSave = (data: Contract) => {
    if (editingId) {
      setContracts(prev => prev.map(c => c.id === editingId ? data : c));
    } else {
      const newContract = { ...data, id: Date.now().toString() };
      setContracts(prev => [...prev, newContract]);
    }
    setView('LIST');
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('के तपाईं निश्चित हुनुहुन्छ? यो डाटा स्थायी रूपमा हट्नेछ।')) {
      setContracts(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setView('EDIT');
  };

  const handlePrint = (id: string) => {
    setPrintId(id);
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchesSearch = 
        c.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tenderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.firmName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesWard = filterWard ? c.wardNo === filterWard : true;
      const matchesFY = filterFY ? c.fiscalYear === filterFY : true;

      return matchesSearch && matchesWard && matchesFY;
    });
  }, [contracts, searchTerm, filterWard, filterFY]);

  const stats = useMemo(() => {
    const totalContractAmount = contracts.reduce((acc, curr) => acc + (Number(curr.contractAmount) || 0), 0);
    const totalPaidAmount = contracts.reduce((acc, curr) => {
      const contractPaid = curr.installments?.reduce((iAcc, iCurr) => iAcc + (Number(iCurr.amount) || 0), 0) || 0;
      return acc + contractPaid;
    }, 0);

    return {
      count: contracts.length,
      totalContractAmount,
      totalPaidAmount,
      activeProjects: contracts.filter(c => Number(c.physicalProgress) < 100).length
    };
  }, [contracts]);

  const fiscalYears = useMemo(() => {
    return Array.from(new Set(contracts.map(c => c.fiscalYear))).sort().reverse();
  }, [contracts]);

  const exportToFile = () => {
    const dataStr = JSON.stringify(contracts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cms_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          if (confirm('मौजुदा डाटा ओभरराइट गरिनेछ। के तपाईं जारी राख्न चाहनुहुन्छ?')) {
            setContracts(imported);
            alert('डाटा सफलतापूर्वक आयात गरियो।');
          }
        }
      } catch (err) {
        alert('डाटा फाइल अवैध छ।');
      }
    };
    reader.readAsText(file);
  };

  if (printId) {
    const c = contracts.find(item => item.id === printId);
    if (!c) return null;

    return (
      <div className="bg-white min-h-screen p-10 font-serif text-black print:p-0">
        <div className="max-w-4xl mx-auto border-2 border-black p-8">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-bold uppercase tracking-widest">ठेक्का व्यवस्थापन रिपोर्ट</h1>
            <p className="mt-2 font-bold">योजनाको नाम: {c.projectName}</p>
          </div>

          <div className="grid grid-cols-2 gap-y-3 text-sm mb-6">
            <p><strong>आर्थिक वर्ष:</strong> {c.fiscalYear}</p>
            <p><strong>बोलपत्र नं.:</strong> {c.tenderNo}</p>
            <p><strong>वडा नं.:</strong> {c.wardNo}</p>
            <p><strong>योजनाको किसिम:</strong> {c.projectType}</p>
            <p><strong>निर्माण व्यवसायी:</strong> {c.firmName}</p>
            <p><strong>प्यान नं.:</strong> {c.panNo}</p>
            <p><strong>सम्झौता रकम:</strong> Rs. {Number(c.contractAmount).toLocaleString()}</p>
            <p><strong>सम्पन्न हुने मिति:</strong> {c.completionDate}</p>
          </div>

          <h3 className="font-bold border-b border-black mb-2 mt-4">जमानत तथा बीमा विवरण</h3>
          <table className="w-full border-collapse border border-black text-xs mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-1">किसिम</th>
                <th className="border border-black p-1">संस्था</th>
                <th className="border border-black p-1">नं.</th>
                <th className="border border-black p-1">रकम</th>
                <th className="border border-black p-1">म्याद</th>
              </tr>
            </thead>
            <tbody>
              {c.pbRecords.map(r => (
                <tr key={r.id}>
                  <td className="border border-black p-1 text-center">PB</td>
                  <td className="border border-black p-1">{r.institution}</td>
                  <td className="border border-black p-1">{r.no}</td>
                  <td className="border border-black p-1 text-right">{r.amount}</td>
                  <td className="border border-black p-1 text-center">{r.expiry}</td>
                </tr>
              ))}
              {c.apgRecords.map(r => (
                <tr key={r.id}>
                  <td className="border border-black p-1 text-center">APG</td>
                  <td className="border border-black p-1">{r.institution}</td>
                  <td className="border border-black p-1">{r.no}</td>
                  <td className="border border-black p-1 text-right">{r.amount}</td>
                  <td className="border border-black p-1 text-center">{r.expiry}</td>
                </tr>
              ))}
              {c.insuranceRecords.map(r => (
                <tr key={r.id}>
                  <td className="border border-black p-1 text-center">Insurance</td>
                  <td className="border border-black p-1">{r.institution}</td>
                  <td className="border border-black p-1">{r.no}</td>
                  <td className="border border-black p-1">-</td>
                  <td className="border border-black p-1 text-center">{r.expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="font-bold border-b border-black mb-2">भुक्तानी किस्ता विवरण</h3>
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-1">किस्ता</th>
                <th className="border border-black p-1">रकम (Rs.)</th>
                <th className="border border-black p-1">मिति</th>
                <th className="border border-black p-1">मूल्याङ्कन</th>
              </tr>
            </thead>
            <tbody>
              {c.installments.map((inst, i) => (
                <tr key={inst.id}>
                  <td className="border border-black p-1 text-center">{i + 1}</td>
                  <td className="border border-black p-1 text-right">{Number(inst.amount).toLocaleString()}</td>
                  <td className="border border-black p-1 text-center">{inst.payoutDate}</td>
                  <td className="border border-black p-1 text-right">{Number(inst.evaluationAmount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-10 pt-10 grid grid-cols-2 text-center text-sm">
            <div className="border-t border-black pt-2 mx-10 font-bold">तयार गर्ने</div>
            <div className="border-t border-black pt-2 mx-10 font-bold">प्रमाणित गर्ने</div>
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-4 print:hidden">
          <button 
            onClick={() => setPrintId(null)} 
            className="px-6 py-2 bg-gray-200 rounded-lg flex items-center gap-2 font-bold"
          >
            <ChevronLeft size={18} /> पछाडि जानुहोस्
          </button>
          <button 
            onClick={() => window.print()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 font-bold shadow-lg"
          >
            <Printer size={18} /> प्रिन्ट गर्नुहोस्
          </button>
        </div>
      </div>
    );
  }

  const StatsCard = ({ title, value, subValue, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black mt-1 text-gray-800">{value}</p>
        {subValue && <p className="text-xs text-green-600 mt-1 font-medium">{subValue}</p>}
      </div>
      <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-current/20`}>
        <Icon size={28} className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md">
              <Database className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">ठेक्का व्यवस्थापन प्रणाली (CMS)</h1>
            </div>
          </div>

          <nav className="hidden md:flex gap-8">
            <button 
              onClick={() => setView('DASHBOARD')}
              className={`flex items-center gap-2 text-sm font-bold transition-all ${view === 'DASHBOARD' ? 'text-blue-200 scale-105 underline decoration-2 underline-offset-8' : 'opacity-70 hover:opacity-100'}`}
            >
              <BarChart3 size={18} /> डैशबोर्ड
            </button>
            <button 
              onClick={() => setView('LIST')}
              className={`flex items-center gap-2 text-sm font-bold transition-all ${view === 'LIST' ? 'text-blue-200 scale-105 underline decoration-2 underline-offset-8' : 'opacity-70 hover:opacity-100'}`}
            >
              <FileText size={18} /> योजना सूची
            </button>
            <button 
              onClick={() => setView('LETTERS')}
              className={`flex items-center gap-2 text-sm font-bold transition-all ${view === 'LETTERS' ? 'text-blue-200 scale-105 underline decoration-2 underline-offset-8' : 'opacity-70 hover:opacity-100'}`}
            >
              <FilePlus2 size={18} /> पत्र निर्माण
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 border-l border-white/20 pl-4">
              <button onClick={exportToFile} title="Export Data" className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Download size={20} /></button>
              <label className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer" title="Import Data">
                <Upload size={20} /><input type="file" className="hidden" accept=".json" onChange={importFromFile} />
              </label>
            </div>
            <button 
              onClick={() => { setEditingId(null); setView('ADD'); }}
              className="bg-white text-blue-900 px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-50 transition-all font-black text-sm shadow-xl active:scale-95"
            >
              <Plus size={20} /> नयाँ योजना
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {view === 'DASHBOARD' && (
          <div className="space-y-8 animate-fadeIn no-print">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard title="कुल योजनाहरू" value={stats.count} icon={Layers} color="bg-blue-600" />
              <StatsCard title="कुल सम्झौता रकम" value={`Rs. ${stats.totalContractAmount.toLocaleString()}`} icon={Database} color="bg-indigo-600" />
              <StatsCard title="कुल भुक्तानी भएको" value={`Rs. ${stats.totalPaidAmount.toLocaleString()}`} subValue={`${((stats.totalPaidAmount / (stats.totalContractAmount || 1)) * 100).toFixed(1)}% वित्तीय प्रगति`} icon={Calendar} color="bg-emerald-600" />
              <StatsCard title="सञ्चालित योजनाहरू" value={stats.activeProjects} icon={Clock} color="bg-orange-500" />
            </div>

            {/* NEW: Charts Section */}
            <DashboardCharts contracts={contracts} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-gray-800 flex items-center gap-3">
                    <Clock size={24} className="text-blue-600" /> हालका सक्रिय योजनाहरू
                  </h3>
                  <button onClick={() => setView('LIST')} className="text-sm font-bold text-blue-600 hover:underline">सबै हेर्नुहोस्</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-gray-400 text-[10px] uppercase font-black border-b border-gray-50">
                      <tr>
                        <th className="pb-4">आयोजनाको नाम / व्यवसायी</th>
                        <th className="pb-4">सम्झौता रकम</th>
                        <th className="pb-4">भौतिक प्रगति</th>
                        <th className="pb-4 text-right">अवस्था</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {contracts.slice(0, 6).map(c => (
                        <tr key={c.id} className="group">
                          <td className="py-5 pr-4">
                            <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{c.projectName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold uppercase">{c.firmName}</span>
                            </div>
                          </td>
                          <td className="py-5 text-sm font-mono text-gray-600">Rs. {Number(c.contractAmount).toLocaleString()}</td>
                          <td className="py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex-grow bg-gray-100 rounded-full h-2 max-w-[100px]">
                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${c.physicalProgress}%` }}></div>
                              </div>
                              <span className="text-xs font-black text-blue-700">{c.physicalProgress}%</span>
                            </div>
                          </td>
                          <td className="py-5 text-right">
                             <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${Number(c.physicalProgress) === 100 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {Number(c.physicalProgress) === 100 ? 'सम्पन्न' : 'चालु'}
                             </span>
                          </td>
                        </tr>
                      ))}
                      {contracts.length === 0 && (
                        <tr><td colSpan={4} className="py-20 text-center text-gray-400 italic font-medium">अहिलेसम्म कुनै डाटा प्रविष्ट गरिएको छैन।</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-8 text-white shadow-xl">
                  <h4 className="font-black text-lg mb-2 text-white">ब्याकअप डाउनलोड</h4>
                  <p className="text-sm opacity-80 leading-relaxed text-blue-100">
                    डाटा सुरक्षित राख्न समय-समयमा 'Export' सुविधा प्रयोग गरी ब्याकअप फाइल आफ्नो कम्प्युटरमा सेभ गर्नुहोस्।
                  </p>
                  <button onClick={exportToFile} className="mt-6 w-full bg-white text-blue-900 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
                    <Download size={18} /> ब्याकअप डाउनलोड
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                  <h4 className="font-black text-gray-800 mb-4 flex items-center gap-2"><MapPin size={20} className="text-red-500" /> वडागत वितरण</h4>
                  <div className="space-y-4">
                    {Array.from({length: 15}, (_, i) => i + 1).map(w => {
                      const count = contracts.filter(c => Number(c.wardNo) === w).length;
                      if (count === 0) return null;
                      return (
                        <div key={w} className="flex justify-between items-center text-sm">
                          <span className="font-bold text-gray-600">वडा नं. {w}</span>
                          <span className="bg-gray-100 px-3 py-1 rounded-full font-black text-gray-800">{count} योजना</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'LIST' && (
          <div className="space-y-6 animate-fadeIn no-print">
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">योजनाहरूको विस्तृत सूची</h2>
                <p className="text-gray-500 text-sm mt-1">सबै सक्रिय र सम्पन्न ठेक्काहरू यहाँ छन्।</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                 <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select 
                      className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filterFY}
                      onChange={(e) => setFilterFY(e.target.value)}
                    >
                      <option value="">सबै आर्थिक वर्ष</option>
                      {fiscalYears.map(fy => <option key={fy} value={fy}>{fy}</option>)}
                    </select>
                 </div>
                 <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select 
                      className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filterWard}
                      onChange={(e) => setFilterWard(e.target.value)}
                    >
                      <option value="">सबै वडा</option>
                      {Array.from({length: 20}, (_, i) => i + 1).map(w => <option key={w} value={w}>वडा नं. {w}</option>)}
                    </select>
                 </div>
                 <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="खोज्नुहोस्..."
                      className="w-full pl-12 pr-6 py-2 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-100 focus:outline-none shadow-sm transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-gray-400 text-[11px] uppercase font-black border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5">विवरण</th>
                      <th className="px-8 py-5">सम्झौता विवरण</th>
                      <th className="px-8 py-5">प्रगति र वित्तीय अवस्था</th>
                      <th className="px-8 py-5 text-right">कार्य</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredContracts.map(c => {
                      const totalPaid = c.installments?.reduce((acc, i) => acc + (Number(i.amount) || 0), 0) || 0;
                      const financialProgress = (totalPaid / (Number(c.contractAmount) || 1)) * 100;
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{c.tenderNo}</span>
                              <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">{c.fiscalYear}</span>
                            </div>
                            <p className="text-lg font-black text-gray-900 leading-tight mb-1">{c.projectName}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-400 font-bold">
                              <span className="flex items-center gap-1 text-red-500"><MapPin size={12} /> वडा नं. {c.wardNo}</span>
                              <span className="text-gray-200">|</span>
                              <span>{c.firmName}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-gray-700">Rs. {Number(c.contractAmount).toLocaleString()}</p>
                              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                                <Calendar size={10} /> म्याद: {c.completionDate}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-2 max-w-[200px]">
                              <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                <span className="text-gray-500">भौतिक: {c.physicalProgress}%</span>
                                <span className="text-emerald-600">वित्तीय: {financialProgress.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full transition-all" style={{ width: `${c.physicalProgress}%` }}></div>
                              </div>
                              <p className="text-[10px] text-gray-400 font-bold text-right">कुल भुक्तानी: Rs. {totalPaid.toLocaleString()}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handlePrint(c.id)} className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all border border-gray-100" title="प्रिन्ट रिपोर्ट"><Printer size={18} /></button>
                              <button onClick={() => handleEdit(c.id)} className="p-2.5 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-gray-100"><Edit size={18} /></button>
                              <button onClick={() => handleDelete(c.id)} className="p-2.5 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-gray-100"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredContracts.length === 0 && (
                      <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold italic">अवस्था: कुनै पनि योजना फेला परेन।</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {view === 'LETTERS' && (
          <div className="no-print">
            <LetterCenter contracts={contracts} onBack={() => setView('DASHBOARD')} />
          </div>
        )}

        {(view === 'ADD' || view === 'EDIT') && (
          <div className="animate-slideUp no-print">
             <ContractForm 
              initialData={editingId ? contracts.find(c => c.id === editingId) || (INITIAL_CONTRACT as any) : (INITIAL_CONTRACT as any)}
              onSave={handleSave}
              onCancel={() => { setView('LIST'); setEditingId(null); }}
            />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-10 mt-20 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h5 className="font-black text-gray-800 tracking-tight text-lg">ठेक्का व्यवस्थापन प्रणाली (CMS)</h5>
          </div>
          <div className="flex gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span className="text-emerald-500">Private Storage</span>
            <span className="text-blue-500">No API Key Required</span>
            <span className="text-orange-500">Offline Optimized</span>
          </div>
          <p className="text-xs text-gray-300">v2.2.0-Release</p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default App;
