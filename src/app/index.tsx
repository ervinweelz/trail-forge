import { useCallback, useEffect, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Camera, Map, type ViewStateChangeEvent } from '@maplibre/maplibre-react-native';

const INITIAL_CENTER: [number, number] = [-121.7269, 46.8523]; // Mt. Rainier, WA
const STYLE_URL = 'https://demotiles.maplibre.org/style.json';
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

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapCenterRef = useRef<[number, number]>(INITIAL_CENTER);
  const [weather, setWeather] = useState<Weather | null>(null);

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
    console.log(
      `[TrailForge] Drop Waypoint → lat: ${lat.toFixed(6)}, lng: ${lng.toFixed(6)}`
    );
  }, []);

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
        <Camera initialViewState={{ center: INITIAL_CENTER, zoom: 9 }} />
      </Map>
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
  }
});
