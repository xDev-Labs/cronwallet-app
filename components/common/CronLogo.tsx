import { Image } from "react-native";

export const CronLogo = ({ className }: { className: string }) => (
    <Image
        source={require('@/assets/images/cron-black-logo.png')}
        className={className}
        resizeMode="contain"
    />
);