import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
}

export default function PrimaryButton({ title, onPress, disabled, loading }: PrimaryButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            accessible={true}
            accessibilityLabel={title}
            accessibilityRole="button"
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.buttonText}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#0f3460',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
        shadowColor: '#0f3460',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonDisabled: {
        backgroundColor: '#2a2a3e',
        shadowOpacity: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
