import { ScanFace, Smartphone, User } from 'lucide-react-native';
import { View } from 'react-native';

type OnBoardingPagesProps = {
    selected: 'username' | 'biometric' | 'phone';
}

export const OnBoardingPages = ({ selected }: OnBoardingPagesProps) => {
    return (
        <View className="flex-row items-center mb-4 gap-3">
            {selected === 'phone' && (
                <View className="shadow-lg rounded-lg bg-white p-2">
                    <Smartphone size={36} color="#ffffff" fill="#4A3DFF" />
                </View>
            )}

            {selected === 'username' && (
                <View className="shadow-xl rounded-lg">
                    <User size={36} color="#4A3DFF" fill="#4A3DFF" />
                </View>
            )}

            {selected === 'biometric' && (
                <View className="shadow-xl rounded-lg">
                    <ScanFace size={36} color="#4A3DFF" fill="#ffffff" />
                </View>
            )}
        </View>
    );
};
