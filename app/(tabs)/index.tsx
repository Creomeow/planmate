import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';


export default function Index() {
  useEffect(() => {
    // Redirect to events tab
    router.replace('/events');
  }, []);

  return null;
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
