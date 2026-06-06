import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

export type Day = {
  id: number;
  distanceKm: number;
  notes: string;
};

export type Waypoint = {
  id: number;
  name: string;
  notes: string;
  lat: number;
  lng: number;
  dayId: number | null;
};

type TripContextType = {
  tripName: string;
  setTripName: (name: string) => void;
  days: Day[];
  addDay: () => void;
  updateDay: (id: number, field: 'distanceKm' | 'notes', value: string | number) => void;
  deleteDay: (id: number) => void;
  waypoints: Waypoint[];
  addWaypoint: (lat: number, lng: number) => void;
  updateWaypoint: (id: number, field: 'name' | 'notes', value: string) => void;
  assignWaypoint: (id: number, dayId: number | null) => void;
  deleteWaypoint: (id: number) => void;
};

const TripContext = createContext<TripContextType | null>(null);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [tripName, setTripName] = useState('My Trip');
  const [days, setDays] = useState<Day[]>([]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const [savedName, savedDays, savedWaypoints] = await Promise.all([
        AsyncStorage.getItem('trip-name'),
        AsyncStorage.getItem('trip-days'),
        AsyncStorage.getItem('waypoints'),
      ]);
      if (savedName) setTripName(savedName);
      if (savedDays) setDays(JSON.parse(savedDays));
      if (savedWaypoints) setWaypoints(JSON.parse(savedWaypoints));
      setHasLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    AsyncStorage.setItem('trip-name', tripName);
    AsyncStorage.setItem('trip-days', JSON.stringify(days));
    AsyncStorage.setItem('waypoints', JSON.stringify(waypoints));
  }, [tripName, days, waypoints, hasLoaded]);

  function addDay() {
    setDays(prev => [...prev, { id: Date.now(), distanceKm: 0, notes: '' }]);
  }

  function updateDay(id: number, field: 'distanceKm' | 'notes', value: string | number) {
    setDays(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  }

  function deleteDay(id: number) {
    setDays(prev => prev.filter(d => d.id !== id));
  }

  function addWaypoint(lat: number, lng: number) {
    setWaypoints(prev => [...prev, {
      id: Date.now(),
      name: `Waypoint ${prev.length + 1}`,
      notes: '',
      lat,
      lng,
      dayId: null,
    }]);
  }

  function updateWaypoint(id: number, field: 'name' | 'notes', value: string) {
    setWaypoints(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  }

  function assignWaypoint(id: number, dayId: number | null) {
    setWaypoints(prev => prev.map(w => w.id === id ? { ...w, dayId } : w));
  }

  function deleteWaypoint(id: number) {
    setWaypoints(prev => prev.filter(w => w.id !== id));
  }

  return (
    <TripContext.Provider value={{
      tripName, setTripName,
      days, addDay, updateDay, deleteDay,
      waypoints, addWaypoint, updateWaypoint, assignWaypoint, deleteWaypoint,
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripContext must be used inside TripProvider');
  return ctx;
}