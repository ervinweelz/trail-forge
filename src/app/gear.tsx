import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function GearScreen() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState([
    { label: 'Shelter',     weight: 0 },
    { label: 'Sleep System', weight: 0 },
    { label: 'Pack',        weight: 0 },
    { label: 'Clothing',    weight: 0 },
    { label: 'Navigation',  weight: 0 },
    { label: 'Food & Water', weight: 0 },
    { label: 'First Aid',   weight: 0 },
  ]);
  const totalWeight = categories.reduce((total, item) => total + item.weight, 0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
    >
      <View className="px-6 pb-2">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Gear
        </Text>
        <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Base-weight calculator
        </Text>
      </View>

      <View className="mx-4 mt-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <View className="flex-row px-4 py-2 bg-gray-100 dark:bg-gray-800">
          <Text className="flex-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Category
          </Text>
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Weight
          </Text>
        </View>
        {categories.map((item, idx) => (
          <View
            key={item.label}
            className={`flex-row items-center px-4 py-3 ${
              idx < categories.length - 1
                ? 'border-b border-gray-100 dark:border-gray-800'
                : ''
            } bg-white dark:bg-gray-900`}
          >
            <Text className="flex-1 text-sm text-gray-800 dark:text-gray-200">
              {item.label}
            </Text>
            <Text className="text-sm text-gray-400 dark:text-gray-500">
              {item.weight} g  
            </Text>
          </View>
        ))}
        <View className="flex-row items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <Text className="flex-1 text-sm font-bold text-gray-900 dark:text-white">
            Base Weight
          </Text>
          <Text className="text-sm font-bold text-trail-green"> {totalWeight} g</Text>
        </View>
      </View>

      <View className="mx-4 mt-3 rounded-2xl bg-gray-50 dark:bg-gray-900 p-5 border border-gray-100 dark:border-gray-800">
        <Text className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Gear weights are stored locally in SQLite (WatermelonDB). The list syncs across
          devices via PowerSync when online, and works entirely offline.
        </Text>
      </View>
    </ScrollView>
  );
}
