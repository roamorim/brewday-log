import React, { useState } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { createNewSession } from '../services/storageService';
import { useNavigate } from 'react-router-dom';

const NewBrew: React.FC = () => {
  const [name, setName] = useState('');
  const [style, setStyle] = useState('');
  const navigate = useNavigate();

  const handleStart = () => {
    if (!name || !style) return;
    const session = createNewSession(name, style);
    navigate(`/brew/${session.id}`);
  };

  return (
    <Layout title="Start Brewing" showBack>
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name</label>
          <input
            type="text"
            className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            placeholder="e.g., Sunday Stout"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Beer Style</label>
          <input
            type="text"
            className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            placeholder="e.g., Irish Dry Stout"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />
        </div>

        <div className="pt-8">
          <Button 
            onClick={handleStart} 
            disabled={!name || !style}
          >
            Start Brew Day
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NewBrew;