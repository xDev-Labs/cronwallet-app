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
        // Filter out non-digit characters
        const digitsOnly = text.replace(/\D/g, '');

        if (!digitsOnly) {
            // If empty or no digits, clear the current input
            const newCode = [...code];
            newCode[index] = '';
            setCode(newCode);
            onChange?.(newCode.join(''));
            return;
        }

        const newCode = [...code];

        // Check if this is a paste operation (multiple characters)
        if (digitsOnly.length > 1) {
            // Paste operation: distribute digits across inputs starting from current index
            const availableSlots = length - index;
            const digitsToPaste = digitsOnly.slice(0, availableSlots);

            // Fill inputs starting from current index
            for (let i = 0; i < digitsToPaste.length; i++) {
                newCode[index + i] = digitsToPaste[i];
            }

            setCode(newCode);
            onChange?.(newCode.join(''));

            // Focus the next empty input or the last filled input
            const nextEmptyIndex = newCode.findIndex((digit, i) => i > index && digit === '');
            const targetIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(index + digitsToPaste.length, length - 1);

            setTimeout(() => {
                inputRefs.current[targetIndex]?.focus();
            }, 0);

        } else {
            // Single character input - only take the first character
            newCode[index] = digitsOnly[0];
            setCode(newCode);
            onChange?.(newCode.join(''));

            // Auto-focus next input for single character input
            if (digitsOnly[0] && index < length - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }

        // Check for completion
        const codeString = newCode.join('');
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
        <View className="flex-row gap-4">
            {Array.from({ length }).map((_, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    className={cn(
                        'w-12 h-[48px] border rounded-xl text-2xl text-center bg-white font-sans',
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
                    // selectTextOnFocus
                    accessible={true}
                    accessibilityLabel={`Digit ${index + 1} of ${length}`}
                />
            ))}
        </View>
    );
}
