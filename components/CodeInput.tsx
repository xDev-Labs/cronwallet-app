import { useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { cn } from '@/lib/utils';

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
        <View className="flex-row justify-center gap-3">
            {Array.from({ length }).map((_, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    className={cn(
                        'w-14 h-16 border-2 rounded-xl text-2xl font-semibold text-center text-foreground bg-background-secondary',
                        code[index] ? 'border-secondary bg-secondary' : 'border-background-tertiary',
                        error && 'border-error'
                    )}
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
