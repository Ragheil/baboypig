import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MoneyInScreen = ({ route }) => {
  const { farmName } = route.params; // Get farmName from the route params
  console.log(`MoneyInScreen rendered with farmName: ${farmName}`); // Log farmName

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Money In</Text>
      <Text style={styles.farmName}>Current Branch: {farmName}</Text>
      {/* Additional content goes here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  farmName: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default MoneyInScreen;
