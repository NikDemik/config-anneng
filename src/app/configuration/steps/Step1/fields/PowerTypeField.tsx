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
import { Step1FormData } from '../types';
import { POWER_TYPES, MAX_LENGTH_FOR_END_POWER } from '@/lib/validation/constants';
import { Info } from 'lucide-react';

interface PowerTypeFieldProps {
    control: Control<Step1FormData>;
    length: number;
}

export function PowerTypeField({ control, length }: PowerTypeFieldProps) {
    const isLengthOver150 = length > MAX_LENGTH_FOR_END_POWER;

    return (
        <Controller
            name="powerType"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="powerType">Тип питания</FieldLabel>
                    <Select
                        value={field.value}
                        onValueChange={(value) => {
                            if (isLengthOver150 && value !== POWER_TYPES.LINEAR) return;
                            field.onChange(value);
                        }}
                        disabled={isLengthOver150}
                    >
                        <SelectTrigger
                            id="powerType"
                            className={fieldState.invalid ? 'border-red-500' : ''}
                        >
                            <SelectValue placeholder="Выберите тип питания" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={POWER_TYPES.END}>Концевое питание</SelectItem>
                            <SelectItem value={POWER_TYPES.LINEAR}>Линейное питание</SelectItem>
                        </SelectContent>
                    </Select>
                    <FieldDescription>
                        {isLengthOver150 ? (
                            <div className="flex items-center text-amber-600">
                                <Info className="h-4 w-4 mr-1" />
                                При длине линии более 150 м доступно только линейное питание
                            </div>
                        ) : (
                            <>
                                Концевое питание - питание с одного конца линии
                                <br />
                                Линейное питание - питание с двух сторон
                            </>
                        )}
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    );
}
