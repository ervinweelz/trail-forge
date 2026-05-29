import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Day = {
  id: number;
  distanceKm: number;
  notes: string;
};

export default function ItineraryScreen() {
  const insets = useSafeAreaInsets();
  const [tripName, setTripName] = useState('My Trip');
  const [days, setDays] = useState<Day[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const savedName = await AsyncStorage.getItem('trip-name');
      const savedDays = await AsyncStorage.getItem('trip-days');
      if (savedName) setTripName(savedName);
      if (savedDays) setDays(JSON.parse(savedDays));
      setHasLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    AsyncStorage.setItem('trip-name', tripName);
    AsyncStorage.setItem('trip-days', JSON.stringify(days));
  }, [tripName, days, hasLoaded]);

  const totalDistance = days.reduce((sum, day) => sum + day.distanceKm, 0);

  function addDay() {
    const newDay: Day = {
      id: Date.now(),
      distanceKm: 0,
      notes: '',
    };
    setDays(prev => [...prev, newDay]);
  }

  function updateDay(id: number, field: 'distanceKm' | 'notes', value: string | number) {
    setDays(prev =>
      prev.map(day => day.id === id ? { ...day, [field]: value } : day)
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
    >
      <TextInput
          className="px-6 text-3xl font-bold text-gray-900 dark:text-white tracking-tight"
          value={tripName}
          onChangeText={setTripName}
          placeholder="Trip name..."
          placeholderTextColor="#9CA3AF"
        />
      <Text className="px-6 mt-1 text-sm text-gray-500 dark:text-gray-400">
        {days.length} {days.length === 1 ? 'day' : 'days'} · {totalDistance} km
      </Text>
            {/* Day cards */}
      <View className="mx-4 mt-6 gap-3">
        {days.map((day, idx) => (
          <View
            key={day.id}
            className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            {/* Card header — always visible, tappable to expand/collapse */}
            <TouchableOpacity
              onPress={() => setExpandedId(expandedId === day.id ? null : day.id)}
            >
              <View className="flex-row items-center px-4 py-4 bg-white dark:bg-gray-900">
                <Text className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Day {idx + 1}
                </Text>
                <Text className="text-sm text-gray-400 dark:text-gray-500 mr-3">
                  {day.distanceKm} km
                </Text>
                <Text className="text-gray-400 dark:text-gray-500">
                  {expandedId === day.id ? '▼' : '▶'}
                </Text>
              </View>
            </TouchableOpacity>
            {expandedId === day.id && (
              <View className="px-4 pb-4 bg-white dark:bg-gray-900 gap-3 border-t border-gray-100 dark:border-gray-800">
                <View>
                  <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 mt-3">
                    Distance (km)
                  </Text>
                  <TextInput
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-200"
                    keyboardType="numeric"
                    value={String(day.distanceKm === 0 ? '' : day.distanceKm)}
                    onChangeText={(val) => updateDay(day.id, 'distanceKm', parseFloat(val) || 0)}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Notes
                  </Text>
                  <TextInput
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-200"
                    multiline
                    numberOfLines={3}
                    value={day.notes}
                    onChangeText={(val) => updateDay(day.id, 'notes', val)}
                    placeholder="Trail notes, campsite info..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Add Day button */}
      <View className="mx-4 mt-4">
        <TouchableOpacity
          onPress={addDay}
          className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl py-4 items-center"
        >
          <Text className="text-sm font-semibold text-gray-400 dark:text-gray-500">
            + Add Day
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}