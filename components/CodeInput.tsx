import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

interface CodeInputProps {
    length: number;
    onComplete?: (code: string) => void;
    error?: boolean;
    value?: string;
    onChange?: (code: string) => void;
}

export default function CodeInput({ length, onComplete, error, value, onChange }: CodeInputProps) {
    const [code, setCode] = useState<string[]>(
        value ? value.split('').concat(Array(length - value.length).fill('')) : Array(length).fill('')
    );
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    useEffect(() => {
        if (value !== undefined) {
            const newCode = value.split('').concat(Array(length - value.length).fill(''));
            setCode(newCode.slice(0, length));
        }
    }, [value, length]);

    const handleChange = (text: string, index: number) => {
        if (!/^\d*$/.test(text)) return;

        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        const codeString = newCode.join('');
        onChange?.(codeString);

        if (text && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Only auto-complete if onComplete is provided and no onChange
        if (!onChange && onComplete && newCode.every(digit => digit !== '') && newCode.length === length) {
            onComplete(codeString);
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <View className="flex-row justify-center gap-4">
            {Array.from({ length }).map((_, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    className={cn(
                        'w-12 h-[48px] border-2 rounded-xl text-2xl font-bold text-center bg-white',
                        focusedIndex === index
                            ? 'border-primary'
                            : code[index]
                                ? 'border-gray-300 text-foreground-dark'
                                : 'border-gray-200',
                        error && 'border-error'
                    )}
                    value={code[index]}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
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
