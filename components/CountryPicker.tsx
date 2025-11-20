import { ChevronDown } from '@/components/icons/ChevronDown';
import { Text } from '@/components/ui/text';
import { countries, type Country } from '@/lib/constants/countries';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, TextInput, View } from 'react-native';

interface CountryPickerProps {
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
}

export const CountryPicker: React.FC<CountryPickerProps> = ({
  selectedCountry,
  onSelectCountry,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery)
  );

  const handleSelect = (country: Country) => {
    onSelectCountry(country);
    setIsVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      <Pressable
        className="flex-row items-center px-2"
        onPress={() => setIsVisible(true)}
      >
        <Text className="text-xl mr-1.5">{selectedCountry.flag}</Text>
        <Text className="text-base font-base text-foreground-dark mr-1 font-sans">
          {selectedCountry.dialCode}
        </Text>
        <ChevronDown size={18} color="#555555" />
      </Pressable>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 bg-black/50">
          <Pressable
            className="flex-1"
            onPress={() => setIsVisible(false)}
          />
          <View className="bg-background-light rounded-t-3xl max-h-[70%]">
            {/* Header */}
            <View className="p-4 border-b border-gray-200">
              <Text variant="h4" className="text-foreground-dark text-center mb-4">
                Select Country
              </Text>

              {/* Search Input */}
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 text-foreground-dark"
                placeholder="Search country or code..."
                placeholderTextColor="#A0A0A0"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Country List */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  className="flex-row items-center px-4 py-4 border-b border-gray-100 active:bg-gray-50"
                  onPress={() => handleSelect(item)}
                >
                  <Text className="text-2xl mr-3">{item.flag}</Text>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-foreground-dark">
                      {item.name}
                    </Text>
                    <Text className="text-sm text-foreground-tertiary">
                      {item.dialCode}
                    </Text>
                  </View>
                  {selectedCountry.code === item.code && (
                    <Text className="text-primary font-bold">✓</Text>
                  )}
                </Pressable>
              )}
              ListEmptyComponent={
                <View className="p-8 items-center">
                  <Text className="text-foreground-tertiary">
                    No countries found
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
};
