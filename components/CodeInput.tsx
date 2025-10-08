import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface CodeInputProps {
    length: number;
    onComplete: (code: string) => void;
    error?: boolean;
}

export default function CodeInput({ length, onComplete, error }: CodeInputProps) {
    const [code, setCode] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (text: string, index: number) => {
        if (!/^\d*$/.test(text)) return;

        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newCode.every(digit => digit !== '') && newCode.length === length) {
            onComplete(newCode.join(''));
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <View style={styles.container}>
            {Array.from({ length }).map((_, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={[
                        styles.input,
                        code[index] && styles.inputFilled,
                        error && styles.inputError,
                    ]}
                    value={code[index]}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    accessible={true}
                    accessibilityLabel={`Digit ${index + 1} of ${length}`}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    input: {
        width: 56,
        height: 64,
        borderWidth: 2,
        borderColor: '#2a2a3e',
        borderRadius: 12,
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        color: '#fff',
        backgroundColor: '#1a1a2e',
    },
    inputFilled: {
        borderColor: '#0f3460',
        backgroundColor: '#0f3460',
    },
    inputError: {
        borderColor: '#e94560',
    },
});
