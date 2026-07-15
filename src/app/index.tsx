import { useTripContext } from '@/context/TripContext';
import { Camera, type CameraRef, Map, Marker, type ViewStateChangeEvent } from '@maplibre/maplibre-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const INITIAL_CENTER: [number, number] = [103.8198, 1.3521]; // Singapore
const STYLE_URL = 'https://api.maptiler.com/maps/outdoor-v2/style.json?key=3abxJO13uTPi5sndn2Ep';
type Weather = {
  tempC: number;
  windKmh: number;
  description: string;
};



function weatherDescription(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 55) return 'Drizzle';
  if (code <= 65) return 'Rain';
  if (code <= 75) return 'Snow';
  if (code <= 82) return 'Showers';
  return 'Thunderstorm';
}

async function fetchWeather(lat: number, lng: number): Promise<Weather> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weathercode,windspeed_10m`;
  const res = await fetch(url);
  const data = await res.json();
  return {
    tempC: Math.round(data.current.temperature_2m),
    windKmh: Math.round(data.current.windspeed_10m),
    description: weatherDescription(data.current.weathercode),
  };
}
type GeocodingResult = {
  name: string;
  lngLat: [number, number];
};

async function searchPlaces(query: string): Promise<GeocodingResult[]> {
  if (!query.trim()) return [];
  const url =
    `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json` +
    `?key=3abxJO13uTPi5sndn2Ep&limit=5`;
  const res = await fetch(url);
  const data = await res.json();
  return data.features.map((f: any) => ({
    name: f.place_name,
    lngLat: f.center as [number, number],
  }));
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapCenterRef = useRef<[number, number]>(INITIAL_CENTER);
  const [weather, setWeather] = useState<Weather | null>(null);
  const cameraRef = useRef<CameraRef>(null);
  const { days, waypoints, addWaypoint, updateWaypoint, assignWaypoint, deleteWaypoint } = useTripContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedWaypointId, setSelectedWaypointId] = useState<number | null>(null);
  const selectedWaypoint = waypoints.find(w => w.id === selectedWaypointId) ?? null;

 

  useEffect(() => {
    const [lng, lat] = INITIAL_CENTER;
    fetchWeather(lat, lng).then(setWeather);
  }, []);
  const handleRegionChange = useCallback(
    (event: NativeSyntheticEvent<ViewStateChangeEvent>) => {
      mapCenterRef.current = event.nativeEvent.center;
    },
    []
  );


const handleDropWaypoint = useCallback(() => {
  const [lng, lat] = mapCenterRef.current;
  addWaypoint(lat, lng);
}, [addWaypoint]);

  const handleRegionDidChange = useCallback(
  (event: NativeSyntheticEvent<ViewStateChangeEvent>) => {
    const [lng, lat] = event.nativeEvent.center;
    fetchWeather(lat, lng).then(setWeather);
  },
  []
);


  if (Platform.OS === 'web') {
    return (
      <View style={styles.webFallback}>
        <Text style={styles.webFallbackText}>Map requires a native development build.</Text>
        <Text style={styles.webFallbackSub}>
          npx expo run:ios  |  npx expo run:android
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Map
          style={styles.map}
          mapStyle={STYLE_URL}
          onRegionIsChanging={handleRegionChange}
          onRegionDidChange={handleRegionDidChange}
      >
        <Camera ref={cameraRef}
        initialViewState={{ 
          center: INITIAL_CENTER, zoom: 11 }} />
       {waypoints.map(waypoint => (
        <Marker
          key={String(waypoint.id)}
          id={String(waypoint.id)}
          lngLat={[waypoint.lng, waypoint.lat]}
          onPress={() => setSelectedWaypointId(waypoint.id)}
        >
          <View style={[styles.marker, waypoint.dayId !== null && styles.markerAssigned]} />
        </Marker>
      ))}
      </Map>
      
      <View style={[styles.searchContainer, { top: insets.top + 16 }]}>
  <TextInput
    style={styles.searchInput}
    placeholder="Search places..."
    placeholderTextColor="#9CA3AF"
    value={query}
    onChangeText={async (text) => {
      setQuery(text);
      if (text.length > 2) {
        const found = await searchPlaces(text);
        setResults(found);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }}
  />
  {showResults && (
    <FlatList
      data={results}
      keyExtractor={(_, i) => String(i)}
      style={styles.resultsList}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.resultItem}
          onPress={() => {
            cameraRef.current?.flyTo({ center: item.lngLat, zoom: 14, duration: 1200 });
            setQuery(item.name);
            setShowResults(false);
          }}
        >
          <Text style={styles.resultText} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  )}
</View>
      
      {weather && (
          <View style={[styles.weatherChip, { top: insets.top + 16 }]}>
            <Text style={styles.weatherTemp}>{weather.tempC}°C</Text>
            <Text style={styles.weatherDesc}>
              {weather.description} · {weather.windKmh} km/h
            </Text>
          </View>
        )
      }

      <View style={[styles.buttonWrap, { bottom: insets.bottom + 32 }]}>
        <TouchableOpacity
          style={styles.waypointBtn}
          onPress={handleDropWaypoint}
          activeOpacity={0.85}
        >
          <Text style={styles.waypointBtnText}>+ Drop Waypoint</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.crosshairContainer} pointerEvents="none">
  <View style={styles.crosshairMarker} />
  <View style={styles.crosshairShadow} />
</View>

<Modal
  visible={selectedWaypoint !== null}
  transparent
  animationType="slide"
  onRequestClose={() => setSelectedWaypointId(null)}
>
  <TouchableOpacity
    style={styles.modalOverlay}
    activeOpacity={1}
    onPress={() => setSelectedWaypointId(null)}
  />
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
      {selectedWaypoint && (
        <>
          <View style={styles.modalHandle} />

          <Text style={styles.modalLabel}>Name</Text>
          <TextInput
            style={styles.modalInput}
            value={selectedWaypoint.name}
            onChangeText={text => updateWaypoint(selectedWaypoint.id, 'name', text)}
            placeholder="Waypoint name..."
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.modalLabel}>Notes</Text>
          <TextInput
            style={[styles.modalInput, styles.modalInputMultiline]}
            multiline
            numberOfLines={3}
            value={selectedWaypoint.notes}
            onChangeText={text => updateWaypoint(selectedWaypoint.id, 'notes', text)}
            placeholder="Trail notes, conditions, campsite info..."
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.modalLabel}>Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayChipRow}>
            <TouchableOpacity
              style={[styles.dayChip, selectedWaypoint.dayId === null && styles.dayChipActive]}
              onPress={() => assignWaypoint(selectedWaypoint.id, null)}
            >
              <Text style={[styles.dayChipText, selectedWaypoint.dayId === null && styles.dayChipTextActive]}>
                None
              </Text>
            </TouchableOpacity>
            {days.map((day, idx) => (
              <TouchableOpacity
                key={day.id}
                style={[styles.dayChip, selectedWaypoint.dayId === day.id && styles.dayChipActive]}
                onPress={() => assignWaypoint(selectedWaypoint.id, day.id)}
              >
                <Text style={[styles.dayChipText, selectedWaypoint.dayId === day.id && styles.dayChipTextActive]}>
                  Day {idx + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => {
              deleteWaypoint(selectedWaypoint.id);
              setSelectedWaypointId(null);
            }}
          >
            <Text style={styles.deleteBtnText}>Delete Waypoint</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </KeyboardAvoidingView>
</Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  buttonWrap: {
    position: 'absolute',
    alignSelf: 'center',
  },
  waypointBtn: {
    backgroundColor: '#1D6D4A',
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  waypointBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  webFallbackText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111',
  },
  webFallbackSub: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  weatherChip: {
  position: 'absolute',
  alignSelf: 'center',
  backgroundColor: 'rgba(255,255,255,0.95)',
  borderRadius: 20,
  paddingHorizontal: 16,
  paddingVertical: 8,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
  },
  weatherTemp: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  weatherDesc: {
    fontSize: 13,
    color: '#555',
  },
  marker: {
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: '#9CA3AF',
  borderWidth: 3,
  borderColor: '#fff',
  shadowColor: '#000',
  shadowOpacity: 0.3,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
},
markerAssigned: {
  backgroundColor: '#1D6D4A',
},
searchContainer: {
  position: 'absolute',
  left: 16,
  right: 16,
  zIndex: 10,
},
searchInput: {
  backgroundColor: 'rgba(255,255,255,0.97)',
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 15,
  color: '#111',
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
},
resultsList: {
  backgroundColor: '#fff',
  borderRadius: 14,
  marginTop: 6,
  maxHeight: 220,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
},
resultItem: {
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#F3F4F6',
},
resultText: {
  fontSize: 14,
  color: '#111',
},
crosshairContainer: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
},
crosshairMarker: {
  width: 22,
  height: 22,
  borderRadius: 11,
  backgroundColor: 'rgba(224, 251, 249, 0.6)',
  borderWidth: 3,
  borderColor: '#fff',
  shadowColor: '#000',
  shadowOpacity: 0.3,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
},
crosshairShadow: {
  width: 8,
  height: 4,
  borderRadius: 4,
  backgroundColor: 'rgba(0,0,0,0.2)',
  marginTop: 4,
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.3)',
},
modalSheet: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingHorizontal: 20,
  paddingTop: 12,
},
modalHandle: {
  width: 36,
  height: 4,
  borderRadius: 2,
  backgroundColor: '#E5E7EB',
  alignSelf: 'center',
  marginBottom: 20,
},
modalLabel: {
  fontSize: 12,
  fontWeight: '600',
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: 6,
  marginTop: 12,
},
modalInput: {
  backgroundColor: '#F9FAFB',
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 10,
  fontSize: 15,
  color: '#111',
  borderWidth: 1,
  borderColor: '#E5E7EB',
},
modalInputMultiline: {
  height: 80,
  textAlignVertical: 'top',
},
dayChipRow: {
  flexDirection: 'row',
},
dayChip: {
  backgroundColor: '#F9FAFB',
  borderRadius: 100,
  paddingHorizontal: 16,
  paddingVertical: 8,
  marginRight: 8,
  borderWidth: 1,
  borderColor: '#E5E7EB',
},
dayChipActive: {
  backgroundColor: '#1D6D4A',
  borderColor: '#1D6D4A',
},
dayChipText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#374151',
},
dayChipTextActive: {
  color: '#FFFFFF',
},
deleteBtn: {
  marginTop: 20,
  backgroundColor: '#FEF2F2',
  borderRadius: 12,
  paddingVertical: 14,
  alignItems: 'center',
},
deleteBtnText: {
  color: '#EF4444',
  fontWeight: '600',
  fontSize: 15,
},
});
