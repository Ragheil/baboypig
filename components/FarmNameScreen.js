import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const FarmNameScreen = ({ onFarmNameSet }) => {
  const [farmName, setFarmName] = useState('');
  const navigation = useNavigation();

  const handleSave = () => {
    if (farmName.trim()) { // Ensure farm name is not empty
      onFarmNameSet(farmName);
      navigation.navigate('Dashboard');
    } else {
      alert('Please enter a farm name');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Enter Farm Name</Text>
      <TextInput
        style={styles.input}
        value={farmName}
        onChangeText={setFarmName}
        placeholder="Farm Name"
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginVertical: 10,
    elevation: 2,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FarmNameScreen;
