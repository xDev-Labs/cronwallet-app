import CodeInput from '@/components/CodeInput';
import { Text } from '@/components/ui/text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';

export default function CreatePasscodeScreen() {
    const router = useRouter();
    const { phoneNumber, countryCode } = useLocalSearchParams();
    const [error, setError] = useState(false);

    const handlePasscodeComplete = (passcode: string) => {
        setError(false);
        router.push({
            pathname: '/(auth)/confirm-passcode',
            params: {
                passcode,
                phoneNumber,
                countryCode
            }
        });
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 bg-background-secondary">
                <View className="flex-1 px-6 justify-center">
                    <View className="items-center mb-12">
                        <View className="w-20 h-20 rounded-xl bg-secondary items-center justify-center mb-6">
                            <Lock size={32} color="#fff" strokeWidth={2} />
                        </View>
                        <Text variant="h3" className="text-foreground mb-3 text-center">
                            Create Your Passcode
                        </Text>
                        <Text variant="caption" className="text-foreground-secondary text-center leading-6">
                            Enter a 4-digit passcode to secure your account
                        </Text>
                    </View>

                    <View className="items-center mb-8">
                        <CodeInput length={4} onComplete={handlePasscodeComplete} error={error} />
                    </View>

                    <View className="bg-background-tertiary rounded-xl p-4 border-l-4 border-secondary">
                        <Text className="text-sm text-foreground-secondary leading-5">
                            Your passcode will be used to access your account securely
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}
