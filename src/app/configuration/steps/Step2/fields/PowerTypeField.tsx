// src/app/configuration/steps/Step2/fields/PowerTypeField.tsx
'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { ConfigurationData } from '../../shared/types';
import { POWER_TYPES, MAX_LENGTH_FOR_END_POWER } from '../../shared/constants';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect, useRef } from 'react';
import { useConfiguration } from '@/app/configuration/context/ConfigurationContext';

interface PowerTypeFieldProps {
    control: Control<ConfigurationData>;
    length: number;
}

export default function PowerTypeField({ control, length }: PowerTypeFieldProps) {
    const { updateData } = useConfiguration();
    const { setValue, getValues } = useFormContext();

    // Используем ref для отслеживания первого рендера
    // const isMounted = useRef(false);

    const isForcedLinear = length > MAX_LENGTH_FOR_END_POWER;

    // Инициализируем состояние из формы, Локальное состояние только для UI
    const [overrideType, setOverrideType] = useState(() => {
        return getValues('powerTypeOverride') || false;
    });

    // Синхронизация с формой при изменении длины
    useEffect(() => {
        // Пропускаем первый рендер
        // if (!isMounted.current) {
        //     isMounted.current = true;
        //     return;
        // }
        const currentOverride = getValues('powerTypeOverride');

        if (!isForcedLinear) {
            // Если длина <= 150, принудительно сбрасываем override
            if (currentOverride || overrideType) {
                console.log('📏 Длина <= 150 м, сброс override');
                setOverrideType(false);
                setValue('powerTypeOverride', false, { shouldValidate: true });
                updateData({ powerTypeOverride: false });
            }
        } else {
            // Если длина > 150, синхронизируем UI с данными формы
            const formOverride = getValues('powerTypeOverride');
            if (overrideType !== formOverride) {
                setOverrideType(formOverride || false);
            }
        }
    }, [length, isForcedLinear, setValue, updateData, getValues, overrideType]);

    // Определяем, активен ли селектор
    const isSelectDisabled = isForcedLinear && !overrideType;

    // Действие при выборе типа питания в селекторе
    const handlePowerTypeChange = (value: string) => {
        setValue('powerType', value, { shouldValidate: true });
        updateData({ powerType: value as any });
    };

    // Действие при клике на чекбокс
    const handleOverrideChange = (checked: boolean) => {
        // Обновляем локальный state для UI
        setOverrideType(checked);
        console.log('🔄 Чекбокс "принудительно":', checked ? 'ВКЛ' : 'ВЫКЛ');

        // Обновляем форму (react-hook-form)
        setValue('powerTypeOverride', checked, {
            shouldValidate: true, // Перевалидировать форму
            shouldDirty: true, // Пометить как измененное
        });

        // Обновляем контекст (глобальное состояние)
        updateData({ powerTypeOverride: checked });

        // Если чекбокс выключен И длина превышает лимит
        if (!checked && isForcedLinear) {
            console.log('🔄 Автоматический сброс к линейному питанию');

            // Устанавливаем линейное питание
            setValue('powerType', POWER_TYPES.LINEAR, { shouldValidate: true });
            updateData({ powerType: POWER_TYPES.LINEAR });
        }
    };

    return (
        <div className="space-y-4">
            {/* Информационные алерты */}
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
                            value={isSelectDisabled ? POWER_TYPES.LINEAR : field.value}
                            onValueChange={handlePowerTypeChange}
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
                                <span className="flex items-center text-amber-600">
                                    <Info className="h-4 w-4 mr-1" />
                                    Автоматически выбрано линейное питание из-за длины линии более
                                    150 м. Отметьте чекбокс выше, чтобы выбрать другой тип питания.
                                </span>
                            ) : isForcedLinear && overrideType ? (
                                <span className="flex items-center text-blue-600">
                                    <Info className="h-4 w-4 mr-1" />
                                    Вы выбрали принудительное изменение типа питания. Убедитесь в
                                    корректности расчетов.
                                </span>
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
