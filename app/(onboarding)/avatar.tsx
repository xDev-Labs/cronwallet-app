import { UserIcon } from '@/components/icons/UserIcon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/contexts/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    View
} from 'react-native';

const CronLogo = () => (
    <View className="flex-1 w-full items-center justify-center">
        <Image
            source={require('@/assets/images/cron-black-logo.png')}
            className="w-[100px] h-8"
            resizeMode="contain"
        />
    </View>
);

const AVATAR_COLORS = [
    { id: '1', color: '#4A3DFF', name: 'Primary Blue' },
    { id: '2', color: '#9C27B0', name: 'Purple' },
    { id: '3', color: '#E91E63', name: 'Pink' },
    { id: '4', color: '#4CAF50', name: 'Green' },
    { id: '5', color: '#FF9800', name: 'Orange' },
    { id: '6', color: '#F44336', name: 'Red' },
    { id: '7', color: '#FFC107', name: 'Yellow' },
    { id: '8', color: '#009688', name: 'Teal' },
    { id: '9', color: '#3F51B5', name: 'Indigo' },
];

export default function AvatarScreen() {
    const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_COLORS[0].color);
    const { updateUserProfile, completeOnboarding } = useAuth();

    const handleGetStarted = async () => {
        if (!selectedAvatar) {
            return;
        }

        try {
            await updateUserProfile({ avatar: selectedAvatar });
            await completeOnboarding();
            router.replace('/(tabs)');
        } catch (err) {
            console.error('Error completing onboarding:', err);
        }
    };

    const isButtonEnabled = selectedAvatar !== '';

    return (
        <SafeAreaView className="flex-1 bg-background-light">
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View className="flex-1 justify-between bg-background-light mt-20">
                    {/* Header (Logo) */}
                    <View className="items-start px-6 pt-15 pb-10">
                        <CronLogo />
                    </View>

                    {/* Content Area */}
                    <View className="flex-1 px-6 mt-5">
                        {/* <Text variant="h3" className="text-foreground-dark mb-2">
                            Choose your avatar
                        </Text>
                        <Text variant="caption" className="text-foreground-tertiary mb-8 font-sans">
                            Pick a color that represents you
                        </Text> */}

                        {/* Large Preview Avatar */}
                        <View className="items-center mb-12">
                            <View
                                className="w-32 h-32 rounded-full items-center justify-center shadow-lg border-4 border-primary"
                                style={{ backgroundColor: selectedAvatar }}
                            >
                                <UserIcon size={64} color="#FFFFFF" />
                            </View>
                        </View>


                        <Text variant="h4" className="text-foreground-dark mb-2 text-center">
                            Choose your avatar
                        </Text>

                        {/* Avatar Grid */}
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            className="flex-1"
                            contentContainerStyle={{ paddingVertical: 20 }}
                        >
                            <View className="flex-row flex-wrap justify-center gap-5">
                                {AVATAR_COLORS.map((avatar) => (
                                    <Pressable
                                        key={avatar.id}
                                        onPress={() => setSelectedAvatar(avatar.color)}
                                        className="w-24 h-24 rounded-full items-center justify-center border"
                                        style={{
                                            backgroundColor: "#F8F8F8",
                                            borderColor: '#12062B26'
                                        }}
                                    >
                                        {/* <UserIcon
                                            size={36}
                                            color="#FFFFFF"
                                        /> */}
                                    </Pressable>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Get Started Button Container */}
                    <View className={`px-6 pt-2.5 ${Platform.OS === 'ios' ? 'pb-7.5' : 'pb-5'}`}>
                        <Button
                            onPress={handleGetStarted}
                            disabled={!isButtonEnabled}
                            className="shadow-lg shadow-primary/20 font-medium"
                        >
                            Get Started
                        </Button>
                    </View>
                    <View className={`px-6 pt-2.5 ${Platform.OS === 'ios' ? 'pb-7.5' : 'pb-5'}`}>
                        <Button
                            onPress={handleGetStarted}
                            disabled={!isButtonEnabled}
                            className=''
                            variant="outline"
                        // className="shadow-lg shadow-primary/20 font-medium"
                        >
                            Skip for now
                        </Button>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
