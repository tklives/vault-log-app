import { useState } from 'react';
import Button from '../ui/Button';
import { syncCollectionFromFirebase } from '../../utils/syncFromFirebase';

export default function DevTools() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Floating Action Button */}
      <button 
        onClick={toggleMenu}
        className="w-12 h-12 rounded-full bg-[tomato] text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 8l-4 4 4 4" />
          <path d="M17 8l4 4-4 4" />
          <path d="M14 4l-4 16" />
        </svg>
      </button>

      {/* Menu that appears when FAB is clicked */}
      {isOpen && (
        <div className="absolute top-16 right-0 bg-white p-4 rounded-lg shadow-xl shadow-gray-800/20 w-64 flex flex-col gap-2 border border-gray-300">
          <h2 className="text-lg font-semibold mb-2">Dev Tools</h2>
          <Button
            variant="primary"
            onClick={() => syncCollectionFromFirebase('athletes')}
          >
            Sync Athletes from Firebase
          </Button>
          <Button
            variant="primary"
            onClick={() => syncCollectionFromFirebase('poles')}
          >
            Sync Poles from Firebase
          </Button>
          <Button
            variant="primary"
            onClick={() => syncCollectionFromFirebase('meets')}
          >
            Sync Meets from Firebase
          </Button>
          <Button
            variant="primary"
            onClick={() => syncCollectionFromFirebase('attempts')}
          >
            Sync Attempts from Firebase
          </Button>
        </div>
      )}
    </div>
  );
}
