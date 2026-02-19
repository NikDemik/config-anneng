'use client';

import { Controller } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Control, useController } from 'react-hook-form';
import { ConfigurationData } from '../../shared/types';
import { POWER_TYPES, MAX_LENGTH_FOR_END_POWER } from '../../shared/constants';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';

interface PowerTypeFieldProps {
    control: Control<ConfigurationData>;
    length: number;
    isForcedLinear?: boolean;
}

export default function PowerTypeField({ control, length }: PowerTypeFieldProps) {
    const isForcedLinear = length > MAX_LENGTH_FOR_END_POWER;
    const [overrideType, setOverrideType] = useState(false);

    const { field } = useController({
        name: 'powerType',
        control,
        rules: { required: true },
    });

    const { field: overrideField } = useController({
        name: 'powerTypeOverride',
        control,
    });

    // Сброс чекбокса при изменении длины, если длина становится <= 150
    useEffect(() => {
        if (!isForcedLinear) {
            setOverrideType(false);
        }
    }, [isForcedLinear]);

    // Определяем, активен ли селектор
    const isSelectDisabled = isForcedLinear && !overrideType;

    // Определяем текущее значение для селектора
    const selectValue = isForcedLinear && !overrideType ? POWER_TYPES.LINEAR : field.value;

    const handleOverrideChange = (checked: boolean) => {
        setOverrideType(checked);

        // Если чекбокс снят и длина > 150, устанавливаем линейное питание
        if (!checked && isForcedLinear) {
            field.onChange(POWER_TYPES.LINEAR);
        }
    };

    return (
        <div className="space-y-4">
            {isForcedLinear && !overrideType && (
                <Alert className="bg-amber-50 border-amber-200">
                    <Info className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                        При длине линии {length} м (более 150 м) рекомендуется линейное питание.
                    </AlertDescription>
                </Alert>
            )}

            {isForcedLinear && overrideType && (
                <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        Внимание: вы выбрали нестандартный тип питания для линии длиной {length} м.
                        Убедитесь, что это технически реализуемо.
                    </AlertDescription>
                </Alert>
            )}

            <Controller
                name="powerType"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="powerType">
                            Тип питания
                            {isForcedLinear && !overrideType && ' (автоматически выбрано)'}
                        </FieldLabel>

                        <Select
                            value={selectValue}
                            onValueChange={(value) => {
                                if (!isSelectDisabled) {
                                    field.onChange(value);
                                }
                            }}
                            disabled={isSelectDisabled}
                        >
                            <SelectTrigger
                                id="powerType"
                                className={`text-lg ${fieldState.invalid ? 'border-red-500' : ''}`}
                            >
                                <SelectValue placeholder="Выберите тип питания" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={POWER_TYPES.END}>Концевое питание</SelectItem>
                                <SelectItem value={POWER_TYPES.END2}>
                                    Концевое питание c двух сторон
                                </SelectItem>
                                <SelectItem value={POWER_TYPES.LINEAR}>Линейное питание</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Чекбокс для принудительного изменения типа питания */}
                        {isForcedLinear && (
                            <div className="flex items-center space-x-2 mt-2">
                                <Checkbox
                                    id="override-power-type"
                                    checked={overrideType}
                                    onCheckedChange={handleOverrideChange}
                                />
                                <label
                                    htmlFor="override-power-type"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    Изменить тип питания (принудительно)
                                </label>
                            </div>
                        )}

                        <FieldDescription>
                            {isForcedLinear && !overrideType ? (
                                <div className="flex items-center text-amber-600">
                                    <Info className="h-4 w-4 mr-1" />
                                    Автоматически выбрано линейное питание из-за длины линии более
                                    150 м. Отметьте чекбокс выше, чтобы выбрать другой тип питания.
                                </div>
                            ) : isForcedLinear && overrideType ? (
                                <div className="flex items-center text-blue-600">
                                    <Info className="h-4 w-4 mr-1" />
                                    Вы выбрали принудительное изменение типа питания. Убедитесь в
                                    корректности расчетов.
                                </div>
                            ) : (
                                <>
                                    Концевое питание — питание подается с одного конца линии
                                    (рекомендуется до 75 - 100 м).
                                    <br />
                                    Концевое питание с двух сторон — питание подается с двух концов
                                    линии (рекомендуется до 150 м).
                                    <br />
                                    Линейное питание — питание подается на любом участке линии (для
                                    линий более 150 м).
                                </>
                            )}
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />
        </div>
    );
}
