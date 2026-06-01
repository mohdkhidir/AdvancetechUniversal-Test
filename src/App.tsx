import { useState, useEffect, lazy, Suspense } from 'react';
import type { Equipment, Attachment } from './types/equipment';
import { SAMPLE_EQUIPMENT } from './data/sampleData';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { EquipmentList } from './components/EquipmentList';
import { InstallBanner } from './components/InstallBanner';
import { initializeDB, loadEquipmentFromIndexedDB, saveEquipmentToIndexedDB } from './utils/offlineStorage';

const EquipmentDetail = lazy(() => import('./components/EquipmentDetail').then(m => ({ default: m.EquipmentDetail })));
const EquipmentForm = lazy(() => import('./components/EquipmentForm').then(m => ({ default: m.EquipmentForm })));
const TechGapAnalysis = lazy(() => import('./components/TechGapAnalysis').then(m => ({ default: m.TechGapAnalysis })));
const ReportView = lazy(() => import('./components/ReportView').then(m => ({ default: m.ReportView })));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        <p className="mt-4 text-slate-600">Loading...</p>
      </div>
    </div>
  );
}

type View = 'dashboard' | 'equipment' | 'add' | 'detail' | 'edit' | 'techgap' | 'report';

const STORAGE_KEY = 'advancetech-equipment-v2';

async function loadEquipment(): Promise<Equipment[]> {
  try {
    await initializeDB();
    const indexedDBData = await loadEquipmentFromIndexedDB();
    if (indexedDBData.length > 0) {
      return indexedDBData;
    }
  } catch {
    // Fallback to localStorage if IndexedDB fails
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Equipment[];
      const data = parsed.map(e => ({ ...e, attachments: e.attachments ?? [] }));
      // Migrate to IndexedDB
      try {
        await saveEquipmentToIndexedDB(data);
      } catch {
        // IndexedDB save failed, but we have the data from localStorage
      }
      return data;
    }
  } catch {
    // ignore
  }
  return SAMPLE_EQUIPMENT;
}

async function saveEquipment(equipment: Equipment[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(equipment));
  } catch {
    // ignore
  }

  try {
    await saveEquipmentToIndexedDB(equipment);
  } catch {
    // IndexedDB write failed, but localStorage saved it
  }
}

export default function App() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [view, setView] = useState<View>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeApp() {
      const data = await loadEquipment();
      setEquipment(data);
      setIsLoading(false);
    }
    initializeApp();
  }, []);

  useEffect(() => {
    if (!isLoading && equipment.length > 0) {
      saveEquipment(equipment);
    }
  }, [equipment, isLoading]);

  function navigate(v: View) {
    setView(v);
    setSelectedId(null);
  }

  function viewDetail(id: string) {
    setSelectedId(id);
    setView('detail');
  }

  function editEquipment(id: string) {
    setSelectedId(id);
    setView('edit');
  }

  function handleSave(updated: Equipment) {
    setEquipment(prev => {
      const exists = prev.some(e => e.id === updated.id);
      return exists ? prev.map(e => e.id === updated.id ? updated : e) : [...prev, updated];
    });
    if (view === 'edit' && selectedId) {
      setView('detail');
    } else {
      setView('equipment');
    }
  }

  function handleUpdateAttachments(equipmentId: string, attachments: Attachment[]) {
    setEquipment(prev => prev.map(e =>
      e.id === equipmentId ? { ...e, attachments } : e
    ));
  }

  const selectedEquipment = selectedId ? equipment.find(e => e.id === selectedId) : null;

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header currentView={view as 'dashboard' | 'equipment' | 'add' | 'techgap' | 'report'} onNavigate={navigate} />
      <InstallBanner />

      <main className="flex-1 overflow-auto">
        {view === 'dashboard' && (
          <Dashboard equipment={equipment} onViewDetail={viewDetail} />
        )}
        {view === 'equipment' && (
          <EquipmentList equipment={equipment} onViewDetail={viewDetail} onEdit={editEquipment} />
        )}
        {view === 'add' && (
          <EquipmentForm onSave={handleSave} onBack={() => navigate('equipment')} />
        )}
        {view === 'detail' && selectedEquipment && (
          <Suspense fallback={<LoadingFallback />}>
            <EquipmentDetail
              equipment={selectedEquipment}
              onBack={() => navigate('equipment')}
              onEdit={editEquipment}
              onUpdateAttachments={handleUpdateAttachments}
            />
          </Suspense>
        )}
        {view === 'edit' && selectedEquipment && (
          <Suspense fallback={<LoadingFallback />}>
            <EquipmentForm initial={selectedEquipment} onSave={handleSave} onBack={() => setView('detail')} />
          </Suspense>
        )}
        {view === 'techgap' && (
          <Suspense fallback={<LoadingFallback />}>
            <TechGapAnalysis equipment={equipment} onViewDetail={viewDetail} />
          </Suspense>
        )}
        {view === 'report' && (
          <Suspense fallback={<LoadingFallback />}>
            <ReportView equipment={equipment} onViewDetail={viewDetail} />
          </Suspense>
        )}
      </main>
    </div>
  );
}
