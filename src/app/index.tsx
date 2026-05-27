import { useCallback, useRef } from 'react';
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

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapCenterRef = useRef<[number, number]>(INITIAL_CENTER);

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
      >
        <Camera initialViewState={{ center: INITIAL_CENTER, zoom: 9 }} />
      </Map>

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
});
