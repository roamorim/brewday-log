import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getSessions } from '../services/storageService';
import { BrewSession } from '../types';
import { useNavigate } from 'react-router-dom';
import { Beer, ChevronRight, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<BrewSession[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = () => {
      const data = getSessions();
      // Sort by newest first
      setSessions(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };
    loadData();
  }, []);

  return (
    <Layout title="My Brews">
      <div className="p-4 space-y-4">
        
        {sessions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Beer size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No brews yet.</p>
            <p className="text-sm">Start a new session to track your beer.</p>
          </div>
        )}

        {sessions.map((session) => (
          <div 
            key={session.id}
            onClick={() => navigate(`/brew/${session.id}`)}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">{session.name}</h3>
              <p className="text-sm text-gray-500">{session.style}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  session.currentPhase === 'Completed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {session.currentPhase}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(session.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <ChevronRight className="text-gray-300" />
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Dashboard;