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
import { Control } from 'react-hook-form';
import { ConfigurationData } from '../../shared/types';
import { POWER_TYPES, MAX_LENGTH_FOR_END_POWER } from '../../shared/constants';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PowerTypeFieldProps {
    control: Control<ConfigurationData>;
    length: number;
}

export default function PowerTypeField({ control, length }: PowerTypeFieldProps) {
    const isLengthOver150 = length > MAX_LENGTH_FOR_END_POWER;
    const isForcedLinear = isLengthOver150;

    return (
        <div className="space-y-4">
            {isForcedLinear && (
                <Alert className="bg-amber-50 border-amber-200">
                    <Info className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                        При длине линии {length} м (более 150 м) доступно только линейное питание.
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
                            {isForcedLinear && ' (автоматически выбрано)'}
                        </FieldLabel>
                        <Select
                            value={isForcedLinear ? POWER_TYPES.LINEAR : field.value}
                            onValueChange={(value) => {
                                if (!isForcedLinear) {
                                    field.onChange(value);
                                }
                            }}
                            disabled={isForcedLinear}
                        >
                            <SelectTrigger
                                id="powerType"
                                className={`text-lg ${fieldState.invalid ? 'border-red-500' : ''}`}
                            >
                                <SelectValue placeholder="Выберите тип питания" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={POWER_TYPES.END}>Концевое питание</SelectItem>
                                <SelectItem value={POWER_TYPES.LINEAR}>Линейное питание</SelectItem>
                            </SelectContent>
                        </Select>
                        <FieldDescription>
                            {isForcedLinear ? (
                                <div className="flex items-center text-amber-600">
                                    <Info className="h-4 w-4 mr-1" />
                                    Автоматически выбрано линейное питание из-за большой длины линии
                                </div>
                            ) : (
                                <>
                                    Концевое питание — питание подается с одного конца линии (до 150
                                    м).
                                    <br />
                                    Линейное питание — питание подается с двух сторон (для линий
                                    более 150 м).
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
