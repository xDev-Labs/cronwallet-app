import { Text } from "@/components/ui/text";
import { apiService } from "@/lib/services/api";
import { resolveSolDomain } from "@/lib/solana/sns";
import { Contact } from "@/lib/types";
import { normalizePhoneNumber } from "@/lib/utils";
import * as Contacts from "expo-contacts";
import { router, Stack } from "expo-router";
import { ChevronLeft, User } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PaymentInputType =
  | "contact"
  | "cronId"
  | "solName"
  | "phone"
  | "walletAddress"
  | null;

interface PaymentOption {
  type: PaymentInputType;
  value: string;
  displayLabel: string;
  isValidating?: boolean;
  isValid?: boolean;
  validationError?: string;
  userData?: any; // Store user data if found
}

export default function PayAnyoneScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [validatedOption, setValidatedOption] = useState<PaymentOption | null>(
    null
  );
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      setHasPermission(status === "granted");

      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          // Convert phone contacts to app Contact format
          const mappedContacts: Contact[] = data
            .filter(
              (contact) =>
                contact.phoneNumbers && contact.phoneNumbers.length > 0
            )
            .map((contact) => ({
              id: contact.id,
              name: contact.name || "Unknown",
              phone: contact.phoneNumbers?.[0]?.number || "",
              bankingName: contact.name || "Unknown",
            }));
          let sortedContacts = mappedContacts.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setContacts(sortedContacts);
        }
      }
      setLoading(false);
    })();
  }, []);

  const detectInputType = (input: string): PaymentOption | null => {
    const trimmedInput = input.trim();

    if (!trimmedInput) return null;

    // Check if it's a .sol name
    if (trimmedInput.endsWith(".sol")) {
      return {
        type: "solName",
        value: trimmedInput,
        displayLabel: `Pay ${trimmedInput}`,
      };
    }

    // Check if it's a phone number (starts with +)
    if (trimmedInput.startsWith("+")) {
      return {
        type: "phone",
        value: trimmedInput,
        displayLabel: `Pay ${trimmedInput}`,
      };
    }

    // Check if it's a Solana wallet address (32-44 characters, alphanumeric base58)
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (solanaAddressRegex.test(trimmedInput)) {
      return {
        type: "walletAddress",
        value: trimmedInput,
        displayLabel: `Pay ${trimmedInput.slice(0, 8)}...${trimmedInput.slice(-8)}`,
      };
    }

    // Check if it's a Cron ID (alphanumeric, no spaces, reasonable length)
    // Assuming Cron IDs are 3-20 characters without special characters
    const cronIdRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (cronIdRegex.test(trimmedInput)) {
      return {
        type: "cronId",
        value: trimmedInput,
        displayLabel: `Pay Cron ID ${trimmedInput}`,
      };
    }

    return null;
  };

  const validatePaymentOption = async (
    option: PaymentOption
  ): Promise<PaymentOption> => {
    try {
      switch (option.type) {
        case "phone": {
          try {
            // Validate phone number and check if user exists
            const normalizedPhone = normalizePhoneNumber(option.value);
            const response =
              await apiService.getUserByPhoneNumber(normalizedPhone);

            if (response.success && response.data) {
              return {
                ...option,
                isValid: true,
                userData: response.data,
                displayLabel: `Pay ${option.value}`,
              };
            } else {
              return {
                ...option,
                isValid: false,
                validationError: "User not found with this phone number",
              };
            }
          } catch (error: any) {
            // API throws error when user not found
            console.log("Phone validation error:", error.message);
            return {
              ...option,
              isValid: false,
              validationError: "User not found with this phone number",
            };
          }
        }

        case "cronId": {
          try {
            // Get user by Cron ID to fetch full user data
            const response = await apiService.getUserByCronID(option.value);

            if (response.success && response.data) {
              return {
                ...option,
                isValid: true,
                userData: response.data,
                displayLabel: `Pay Cron ID ${option.value}`,
              };
            } else {
              return {
                ...option,
                isValid: false,
                validationError: "No user found with this Cron ID",
              };
            }
          } catch (error: any) {
            // API throws error when user not found
            console.log("Cron ID validation error:", error.message);
            return {
              ...option,
              isValid: false,
              validationError: "No user found with this Cron ID",
            };
          }
        }

        case "solName": {
          try {
            // Validate format first
            if (option.value.length < 5 || !option.value.endsWith(".sol")) {
              return {
                ...option,
                isValid: false,
                validationError: "Invalid .sol name format",
              };
            }

            // Resolve the .sol domain using SNS
            const resolved = await resolveSolDomain(option.value);

            if (resolved && resolved.exists) {
              return {
                ...option,
                isValid: true,
                displayLabel: `Pay ${option.value}`,
                userData: {
                  primary_address: resolved.publicKey.toBase58(),
                },
              };
            } else {
              return {
                ...option,
                isValid: false,
                validationError: "This .sol domain is not registered",
              };
            }
          } catch (error: any) {
            console.log("SNS validation error:", error.message);
            return {
              ...option,
              isValid: false,
              validationError: "Unable to resolve .sol domain",
            };
          }
        }

        case "walletAddress": {
          // Wallet addresses don't need backend validation, just format validation
          return {
            ...option,
            isValid: true,
          };
        }

        default:
          return option;
      }
    } catch (error) {
      console.error("Unexpected validation error:", error);
      return {
        ...option,
        isValid: false,
        validationError: "Validation failed. Please try again.",
      };
    }
  };

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) {
      return contacts;
    }

    const query = searchQuery.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query) ||
        (contact.bankingName &&
          contact.bankingName.toLowerCase().includes(query))
    );
  }, [searchQuery, contacts]);

  const paymentOption = useMemo(() => {
    // Only show payment option if no contacts match
    if (filteredContacts.length === 0 && searchQuery.trim()) {
      return detectInputType(searchQuery);
    }
    return null;
  }, [searchQuery, filteredContacts]);

  // Validate payment option when detected
  useEffect(() => {
    let cancelled = false;

    const validate = async () => {
      if (
        paymentOption &&
        (paymentOption.type === "phone" ||
          paymentOption.type === "cronId" ||
          paymentOption.type === "solName")
      ) {
        setIsValidating(true);
        setValidatedOption(null);

        const validated = await validatePaymentOption(paymentOption);

        if (!cancelled) {
          setValidatedOption(validated);
          setIsValidating(false);
        }
      } else if (paymentOption) {
        // For wallet addresses, no async validation needed
        setValidatedOption({
          ...paymentOption,
          isValid: true,
        });
        setIsValidating(false);
      } else {
        setValidatedOption(null);
        setIsValidating(false);
      }
    };

    // Debounce validation
    const timeoutId = setTimeout(validate, 500);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [paymentOption]);

  const handleContactPress = (contact: Contact) => {
    router.push({
      pathname: "/(tabs)/recipient",
      params: {
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phone,
        contactAvatarUrl: contact.avatarUrl || "",
        contactCronId: contact.cronId || "",
        contactJoinedDate: contact.joinedDate || "",
        type: "contact",
      },
    });
  };

  const handlePaymentOptionPress = (option: PaymentOption) => {
    // Navigate to recipient screen with appropriate data based on type
    // For phone and cronId types, userData should be populated from API
    const userData = option.userData;

    router.push({
      pathname: "/(tabs)/recipient",
      params: {
        contactId: userData?.user_id || `${option.type}_${option.value}`,
        contactName: userData?.cron_id || option.value,
        contactPhone: userData?.phone_number || option.value,
        contactAvatarUrl: userData?.avatar_url || "",
        contactCronId: userData?.cron_id || "",
        contactJoinedDate: "",
        type: option.type,
        // Add custom fields for special types
        ...(option.type === "solName" && {
          solName: option.value,
          walletAddress: userData?.primary_address, // Resolved .sol domain address
          contactName: option.value,
        }),
        ...(option.type === "walletAddress" && {
          walletAddress: option.value,
          // For wallet addresses, we might not have userData
          contactName: option.value,
        }),
      },
    });
  };

  const renderAvatar = (contact: Contact) => {
    if (contact.avatarUrl) {
      return (
        <Image
          source={{ uri: contact.avatarUrl }}
          className="w-12 h-12 rounded-full"
        />
      );
    }

    const initial = contact.name.charAt(0).toUpperCase();
    const colors = ["#E91E63", "#9C27B0", "#FF5722", "#2196F3", "#4CAF50"];
    const colorIndex = contact.name.charCodeAt(0) % colors.length;

    return (
      <View
        className="w-12 h-12 rounded-full items-center justify-center"
        style={{ backgroundColor: colors[colorIndex] }}
      >
        <Text className="text-white text-xl font-bold">{initial}</Text>
      </View>
    );
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <Pressable
      onPress={() => handleContactPress(item)}
      className="flex-row items-center white rounded-xl py-2 active:opacity-80"
    >
      {renderAvatar(item)}
      <View className="flex-1 ml-3">
        <Text className="text-black text-base font-semibold ">{item.name}</Text>
        <Text className="text-foreground-secondary text-sm">{item.phone}</Text>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
          <Pressable onPress={() => router.back()} className="px-4 py-3">
            <ChevronLeft size={24} color="#000" />
          </Pressable>
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4A3DFF" />
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (hasPermission === false) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
          <Pressable onPress={() => router.back()} className="px-4 py-3">
            <ChevronLeft size={24} color="#000" />
          </Pressable>
          <View className="flex-1 justify-center items-center px-8">
            <User size={64} color="#8E8E93" />
            <Text
              variant="h4"
              className="text-foreground-dark mt-4 text-center"
            >
              Contacts Permission Required
            </Text>
            <Text
              variant="caption"
              className="text-foreground-secondary mt-2 text-center"
            >
              Please grant access to your contacts to view and select them for
              payments.
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="flex-1 justify-between bg-background-light">
            <Pressable onPress={() => router.back()} className="px-4 py-3">
              <ChevronLeft size={24} color="#000" />
            </Pressable>

            {/* Content Area */}
            <View className="flex-1 px-6">
              <Text variant="h3" className="text-foreground-dark">
                Pay anyone
              </Text>
              <Text
                variant="caption"
                className="text-foreground-tertiary mb-8 font-sans"
              >
                Pay using phone, Cron ID, .sol name, or wallet address
              </Text>

              {/* Search Input */}
              <View className="pb-4">
                <View className="relative">
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Name, phone, Cron ID, .sol, or address"
                    className="h-14 font-sans rounded-xl border-2 border-gray-200 bg-gray-50 px-4 pr-12 text-base text-black leading-5 py-2"
                    placeholderTextColor="#8E8E93"
                    multiline={false}
                    numberOfLines={1}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                  />
                  <View className="absolute right-4 top-1/2 -translate-y-1/2">
                    <User size={20} color="#8E8E93" />
                  </View>
                </View>
              </View>

              {/* Payment Option Card (for non-contact inputs) */}
              {paymentOption && (
                <View className="mb-6">
                  {isValidating ? (
                    <View className="flex-row items-center bg-gray-100 border-2 border-gray-200 rounded-xl p-4">
                      <View className="w-12 h-12 rounded-full items-center justify-center bg-gray-300">
                        <ActivityIndicator size="small" color="#4A3DFF" />
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-black text-base font-semibold">
                          {paymentOption.displayLabel}
                        </Text>
                        <Text className="text-foreground-secondary text-sm">
                          Verifying...
                        </Text>
                      </View>
                    </View>
                  ) : validatedOption?.isValid === false ? (
                    <View className="flex-row items-center bg-red-50 border-2 border-red-300 rounded-xl p-4">
                      <View className="w-12 h-12 rounded-full items-center justify-center bg-red-200">
                        <User size={24} color="#DC2626" />
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-black text-base font-semibold">
                          {paymentOption.displayLabel}
                        </Text>
                        <Text className="text-red-600 text-sm">
                          {validatedOption.validationError}
                        </Text>
                      </View>
                    </View>
                  ) : validatedOption?.isValid === true ? (
                    <Pressable
                      onPress={() => handlePaymentOptionPress(validatedOption)}
                      className="flex-row items-center bg-primary/5 border-2 border-primary rounded-xl p-4 active:opacity-80"
                    >
                      <View className="w-12 h-12 rounded-full items-center justify-center bg-primary">
                        <User size={24} color="#FFFFFF" />
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-black text-base font-semibold">
                          {validatedOption.displayLabel}
                        </Text>
                        <Text className="text-green-600 text-sm font-medium">
                          {validatedOption.type === "cronId" &&
                            "✓ Cron User Found"}
                          {validatedOption.type === "solName" &&
                            "✓ Valid .sol Name"}
                          {validatedOption.type === "phone" && "✓ User Found"}
                          {validatedOption.type === "walletAddress" &&
                            "✓ Valid Wallet Address"}
                        </Text>
                      </View>
                    </Pressable>
                  ) : null}
                </View>
              )}

              {/* Contact List */}
              <View className="flex-1">
                {filteredContacts.length > 0 && (
                  <Text className="text-lg font-semibold text-foreground-dark mb-4">
                    Your Contacts
                  </Text>
                )}

                <FlatList
                  data={filteredContacts}
                  renderItem={renderContact}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
