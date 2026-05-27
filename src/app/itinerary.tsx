import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ItineraryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
    >
      <View className="px-6 pb-4">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Itinerary
        </Text>
        <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Trip logistics planner
        </Text>
      </View>

      <View className="mx-4 mt-4 rounded-2xl bg-gray-50 dark:bg-gray-900 p-5 border border-gray-100 dark:border-gray-800">
        <Text className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
          Planned Feature: Drag-and-Drop Day Planner
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Each day card will hold waypoints, campsites, and mileage estimates pulled
          from the local SQLite trail database. Reorder days with a long-press gesture.
        </Text>
      </View>

      <View className="mx-4 mt-3 rounded-2xl bg-gray-50 dark:bg-gray-900 p-5 border border-gray-100 dark:border-gray-800">
        <Text className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
          Planned Feature: Weather & Permit Alerts
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          RAG AI backend will surface permit windows, fire closures, and forecasted
          weather for the exact corridors in your itinerary.
        </Text>
      </View>
    </ScrollView>
  );
}
