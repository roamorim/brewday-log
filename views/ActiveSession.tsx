// Added React to the import to resolve the 'Cannot find namespace React' error
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionById, saveSession } from '../services/storageService';
import { getBrewAdvice } from '../services/geminiService';
import { BrewSession, BrewPhase, PhaseData } from '../types';
import { PHASE_ORDER, PHASE_DESCRIPTIONS } from '../constants';
import Layout from '../components/Layout';
import Button from '../components/Button';
import BrewTimer from '../components/BrewTimer';
import { CheckCircle, ArrowRight, ArrowLeft, Bot, X, Beaker, Waves, Plus, Droplets, Settings } from 'lucide-react';

// HELPER COMPONENTS & FUNCTIONS MOVED OUTSIDE TO PREVENT FOCUS LOSS
const getConvertedTemp = (value: string, unit: 'C' | 'F'): string => {
  if (!value) return '';
  const val = parseFloat(value);
  if (isNaN(val)) return '';
  
  if (unit === 'F') {
    const c = (val - 32) * 5 / 9;
    return `${c.toFixed(1)} °C`;
  } else {
    const f = (val * 9 / 5) + 32;
    return `${f.toFixed(1)} °F`;
  }
};

interface TempInputRowProps {
  label: string;
  value: string;
  tempUnit: 'C' | 'F';
  onChange: (val: string) => void;
}

const TempInputRow: React.FC<TempInputRowProps> = ({ 
  label, 
  value, 
  tempUnit,
  onChange 
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <input 
          type="number" 
          inputMode="decimal"
          placeholder="0.0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 pr-10 border rounded-lg text-lg focus:ring-2 focus:ring-amber-500 outline-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
          °{tempUnit}
        </span>
      </div>
      <div className="w-24 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm font-medium text-center">
        {getConvertedTemp(value, tempUnit) || '--'}
      </div>
    </div>
  </div>
);

const ActiveSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<BrewSession | null>(null);
  
  // Phase Data State
  const [notes, setNotes] = useState('');
  const [temp, setTemp] = useState(''); 
  const [initialTemp, setInitialTemp] = useState('');
  const [finalTemp, setFinalTemp] = useState('');
  const [gravity, setGravity] = useState('');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('F');

  // Boiling specific states
  const [preBoilGravity, setPreBoilGravity] = useState('');
  const [postBoilGravity, setPostBoilGravity] = useState('');
  const [preBoilVolume, setPreBoilVolume] = useState('');
  const [postBoilVolume, setPostBoilVolume] = useState('');

  // Water Bottle Counter States (Mashing)
  const [waterBottlesCount, setWaterBottlesCount] = useState(0);
  const [bottleVolume, setBottleVolume] = useState('1.5'); // Default 1.5L

  // AI State
  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const data = getSessionById(id);
      if (data) {
        setSession(data);
        loadPhaseData(data, data.currentPhase);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  const loadPhaseData = (s: BrewSession, phase: BrewPhase) => {
    const phaseData = s.data[phase] || { notes: '', temperature: '', gravity: '', initialTemperature: '', finalTemperature: '', tempUnit: 'F' };
    setNotes(phaseData.notes || '');
    setTemp(phaseData.temperature || '');
    setInitialTemp(phaseData.initialTemperature || '');
    setFinalTemp(phaseData.finalTemperature || '');
    setGravity(phaseData.gravity || '');
    setTempUnit(phaseData.tempUnit || 'F');
    
    setPreBoilGravity(phaseData.preBoilGravity || '');
    setPostBoilGravity(phaseData.postBoilGravity || '');
    setPreBoilVolume(phaseData.preBoilVolume || '');
    setPostBoilVolume(phaseData.postBoilVolume || '');

    // Load water bottle data
    setWaterBottlesCount(phaseData.waterBottlesCount || 0);
    setBottleVolume(phaseData.bottleVolume || '1.5');
  };

  const saveCurrentPhase = (currentSession: BrewSession) => {
    // CRITICAL: Fetch latest session from storage to avoid overwriting timer data
    const latestSession = getSessionById(currentSession.id) || currentSession;
    
    const updatedSession = { ...latestSession };
    const currentData: PhaseData = {
      notes,
      temperature: temp,
      initialTemperature: initialTemp,
      finalTemperature: finalTemp,
      tempUnit,
      gravity: gravity,
      preBoilGravity,
      postBoilGravity,
      preBoilVolume,
      postBoilVolume,
      waterBottlesCount,
      bottleVolume
    };

    updatedSession.data[currentSession.currentPhase] = currentData;
    saveSession(updatedSession);
    setSession(updatedSession);
    return updatedSession;
  };

  const handleNextPhase = () => {
    if (!session) return;
    const updatedSession = saveCurrentPhase(session);
    
    const currentIndex = PHASE_ORDER.indexOf(updatedSession.currentPhase);
    if (currentIndex < PHASE_ORDER.length - 1) {
      const nextPhase = PHASE_ORDER[currentIndex + 1];
      updatedSession.currentPhase = nextPhase;
      saveSession(updatedSession);
      setSession(updatedSession);
      loadPhaseData(updatedSession, nextPhase);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPhase = () => {
    if (!session) return;
    const updatedSession = saveCurrentPhase(session);

    const currentIndex = PHASE_ORDER.indexOf(updatedSession.currentPhase);
    if (currentIndex > 0) {
      const prevPhase = PHASE_ORDER[currentIndex - 1];
      updatedSession.currentPhase = prevPhase;
      saveSession(updatedSession);
      setSession(updatedSession);
      loadPhaseData(updatedSession, prevPhase);
      window.scrollTo(0, 0);
    }
  };

  const handleAskAI = async () => {
    if (!aiQuery || !session) return;
    setIsAiLoading(true);
    const context = `Beer Name: ${session.name}, Style: ${session.style}. Current Phase: ${session.currentPhase}. Phase Notes: ${notes}`;
    const response = await getBrewAdvice(session.currentPhase, aiQuery, context);
    setAiResponse(response);
    setIsAiLoading(false);
  };

  if (!session) return <Layout><div className="p-8 text-center">Loading session...</div></Layout>;

  const phaseIndex = PHASE_ORDER.indexOf(session.currentPhase);
  const progress = ((phaseIndex + 1) / PHASE_ORDER.length) * 100;
  const isFirstPhase = phaseIndex === 0;
  const isLastPhase = phaseIndex === PHASE_ORDER.length - 1;

  const totalWaterVolume = (waterBottlesCount * parseFloat(bottleVolume || '0')).toFixed(2);

  return (
    <Layout title={session.name} showBack>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2">
        <div className="bg-amber-600 h-2 transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Phase Header */}
        <div className="text-center py-2">
          <div className="text-amber-600 font-bold text-xs uppercase tracking-widest mb-1">
            Step {phaseIndex + 1} of {PHASE_ORDER.length}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{session.currentPhase}</h2>
          <p className="text-gray-500 text-sm mt-1">{PHASE_DESCRIPTIONS[session.currentPhase]}</p>
        </div>

        {/* Global Timer - Visible if in a key phase OR if it's already running */}
        {(session.currentPhase === BrewPhase.Mashing || 
          session.currentPhase === BrewPhase.Boiling || 
          session.timerIsRunning) && (
          <BrewTimer 
            sessionId={session.id} 
            onTimerChange={() => {
              const updated = getSessionById(session.id);
              if (updated) setSession(updated);
            }}
          />
        )}

        {/* Dynamic Forms based on Phase */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
          
          {/* Unit Toggle */}
          {(session.currentPhase === BrewPhase.Mashing || 
            session.currentPhase === BrewPhase.Sparging || 
            session.currentPhase === BrewPhase.Boiling ||
            session.currentPhase === BrewPhase.Chilling ||
            session.currentPhase === BrewPhase.Fermentation) && (
            <div className="flex justify-end mb-2">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setTempUnit('C')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    tempUnit === 'C' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  °C
                </button>
                <button 
                  onClick={() => setTempUnit('F')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    tempUnit === 'F' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  °F
                </button>
              </div>
            </div>
          )}

          {/* Mashing Specific Fields */}
          {session.currentPhase === BrewPhase.Mashing && (
            <div className="space-y-6">
              
              {/* Bottle Counter UI */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-blue-800 font-bold text-sm uppercase">
                    <Droplets size={18} className="text-blue-500" /> Water Addition
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-1 rounded border border-blue-100">
                    <Settings size={12} />
                    <span>Bottle Size:</span>
                    <input 
                      type="number" 
                      inputMode="decimal"
                      value={bottleVolume} 
                      onChange={(e) => setBottleVolume(e.target.value)}
                      className="w-10 text-center font-bold text-blue-700 focus:outline-none bg-transparent"
                    />
                    <span>L</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setWaterBottlesCount(prev => prev + 1)}
                    className="flex-1 bg-blue-600 text-white py-4 rounded-xl shadow-md active:scale-95 transition-transform flex flex-col items-center justify-center gap-1"
                  >
                    <Plus size={24} strokeWidth={3} />
                    <span className="font-bold text-sm uppercase tracking-wider">+1 Bottle</span>
                  </button>

                  <div className="flex-1 bg-white p-3 rounded-xl border border-blue-100 text-center flex flex-col justify-center">
                    <div className="text-2xl font-black text-blue-900 leading-none">{waterBottlesCount}</div>
                    <div className="text-[10px] uppercase text-blue-500 font-bold mt-1">Bottles</div>
                    <div className="mt-2 pt-2 border-t border-blue-50 flex items-baseline justify-center gap-1">
                      <span className="text-lg font-bold text-blue-700">{totalWaterVolume}</span>
                      <span className="text-xs font-medium text-blue-400">Total L</span>
                    </div>
                  </div>
                </div>

                {waterBottlesCount > 0 && (
                  <button 
                    onClick={() => setWaterBottlesCount(0)}
                    className="w-full mt-3 py-1 text-[10px] text-blue-400 font-bold uppercase hover:text-blue-600 transition-colors"
                  >
                    Reset Count
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <TempInputRow 
                  label="Initial Strike Temperature" 
                  value={initialTemp} 
                  tempUnit={tempUnit}
                  onChange={setInitialTemp} 
                />
                <TempInputRow 
                  label="Final Mash Temperature" 
                  value={finalTemp} 
                  tempUnit={tempUnit}
                  onChange={setFinalTemp} 
                />
              </div>
            </div>
          )}

          {/* Generic Temperature (Single Input) */}
          {(session.currentPhase === BrewPhase.Sparging || 
            session.currentPhase === BrewPhase.Boiling ||
            session.currentPhase === BrewPhase.Chilling ||
            session.currentPhase === BrewPhase.Fermentation) && (
             <TempInputRow 
               label={`Temperature (${session.currentPhase === BrewPhase.Boiling ? 'Peak' : 'Target'})`}
               value={temp}
               tempUnit={tempUnit}
               onChange={setTemp}
             />
          )}

          {/* Boiling Specific Metrics */}
          {session.currentPhase === BrewPhase.Boiling && (
            <div className="space-y-6 pt-2">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase">
                  <Waves size={16} /> Pre-Boil Metrics
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Gravity (SG)</label>
                    <input 
                      type="number" inputMode="decimal" placeholder="1.045"
                      value={preBoilGravity} onChange={(e) => setPreBoilGravity(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Volume</label>
                    <input 
                      type="number" inputMode="decimal" placeholder="L/Gal"
                      value={preBoilVolume} onChange={(e) => setPreBoilVolume(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-4">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase">
                  <Beaker size={16} /> Post-Boil Metrics
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Gravity (OG)</label>
                    <input 
                      type="number" inputMode="decimal" placeholder="1.055"
                      value={postBoilGravity} onChange={(e) => setPostBoilGravity(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Volume</label>
                    <input 
                      type="number" inputMode="decimal" placeholder="L/Gal"
                      value={postBoilVolume} onChange={(e) => setPostBoilVolume(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gravity Reading */}
          {(session.currentPhase === BrewPhase.Fermentation || 
            session.currentPhase === BrewPhase.Bottling) && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {session.currentPhase === BrewPhase.Fermentation ? 'Current Gravity' : 
                 session.currentPhase === BrewPhase.Bottling ? 'Final Gravity (FG)' : 'Gravity Reading'}
              </label>
              <input 
                type="number" 
                inputMode="decimal"
                placeholder="1.010"
                value={gravity}
                onChange={(e) => setGravity(e.target.value)}
                className="w-full p-3 border rounded-lg text-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes / Logs</label>
            <textarea 
              rows={4}
              placeholder={`Log details about your ${session.currentPhase.toLowerCase()}...`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <div className="flex gap-3">
            {!isFirstPhase && (
              <Button variant="outline" onClick={handlePrevPhase} className="flex-1">
                <ArrowLeft size={20} />
                <span>Prev</span>
              </Button>
            )}
            
            {!isLastPhase ? (
               <Button onClick={handleNextPhase} className={`shadow-lg shadow-amber-200 ${isFirstPhase ? 'w-full' : 'flex-1'}`}>
                 <span>Next Phase</span>
                 <ArrowRight size={20} />
               </Button>
            ) : (
              session.currentPhase !== BrewPhase.Completed && (
                <Button onClick={handleNextPhase} className="flex-1 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200">
                  <span>Complete Brew</span>
                  <CheckCircle size={20} />
                </Button>
              )
            )}
          </div>

          <Button variant="secondary" onClick={() => setShowAI(true)}>
             <Bot size={20} />
             <span>Ask AI Assistant</span>
          </Button>
        </div>

      </div>

      {/* AI Modal/Overlay */}
      {showAI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
          <div ref={aiRef} className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Bot size={20} /> Brewmaster AI
              </h3>
              <button onClick={() => setShowAI(false)} className="hover:bg-indigo-700 p-1 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto bg-gray-50">
              {aiResponse ? (
                <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-100 text-gray-800">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{aiResponse}</p>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>Ask me anything about {session.currentPhase}!</p>
                  <p className="text-xs mt-2">Example: "What temp should I pitch yeast?"</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                />
                <button 
                  onClick={handleAskAI}
                  disabled={isAiLoading || !aiQuery}
                  className="bg-indigo-600 text-white p-2 rounded-lg disabled:opacity-50"
                >
                  {isAiLoading ? '...' : <ArrowRight size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default ActiveSession;