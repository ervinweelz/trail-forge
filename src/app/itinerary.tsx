import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTripContext } from '@/context/TripContext';

export default function ItineraryScreen() {
  const insets = useSafeAreaInsets();
  const { tripName, setTripName, days, addDay, updateDay, deleteDay, waypoints, assignWaypoint } = useTripContext();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const totalDistance = days.reduce((sum, day) => sum + day.distanceKm, 0);

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

      <View className="mx-4 mt-6 gap-3">
        {days.map((day, idx) => {
          const dayWaypoints = waypoints.filter(w => w.dayId === day.id);
          return (
          <View
            key={day.id}
            className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <TouchableOpacity
              onPress={() => setExpandedId(expandedId === day.id ? null : day.id)}
            >
              <View className="flex-row items-center px-4 py-4 bg-white dark:bg-gray-900">
                <Text className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Day {idx + 1}
                </Text>
                <Text className="text-sm text-gray-400 dark:text-gray-500 mr-3">
                  {day.distanceKm} km · {dayWaypoints.length} {dayWaypoints.length === 1 ? 'waypoint' : 'waypoints'}
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
                {dayWaypoints.length > 0 && (
                  <View>
                    <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Waypoints
                    </Text>
                    <View className="gap-2">
                      {dayWaypoints.map(waypoint => (
                        <View
                          key={waypoint.id}
                          className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3"
                        >
                          <Text className="flex-1 text-sm text-gray-800 dark:text-gray-200" numberOfLines={1}>
                            {waypoint.name}
                          </Text>
                          <TouchableOpacity
                            onPress={() => assignWaypoint(waypoint.id, null)}
                            className="ml-3 bg-red-50 px-2 py-1 rounded-lg"
                          >
                            <Text className="text-red-500 font-semibold text-sm">x</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => deleteDay(day.id)}
                  className="mt-2 bg-red-50 rounded-xl py-3 items-center"
                >
                  <Text className="text-red-500 font-semibold text-sm">Delete Day</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          );
        })}
      </View>

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