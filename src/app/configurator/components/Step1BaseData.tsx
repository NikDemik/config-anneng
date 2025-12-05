import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';

export default function Step1BaseData({ onNext }: { onNext: (data: any) => void }) {
    const [length, setLength] = useState('');
    const [poles, setPoles] = useState('');
    const [voltage, setVoltage] = useState('');
    const [cranes, setCranes] = useState('');

    const submit = () => {
        onNext({
            length: Number(length),
            poles: Number(poles),
            voltage: Number(voltage),
            cranes: Number(cranes),
        });
    };

    return (
        <Card className="p-6 max-w-xl">
            <CardHeader>
                <h2 className="text-2xl font-semibold">Основные параметры линии</h2>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Длина линии */}
                <div className="space-y-2">
                    <Label>Длина линии (м)</Label>
                    <Input
                        type="number"
                        min={1}
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        placeholder="Например: 30"
                    />
                </div>

                {/* Количество жил */}
                <div className="space-y-2">
                    <Label>Количество жил</Label>
                    <Input
                        type="number"
                        min={1}
                        value={poles}
                        onChange={(e) => setPoles(e.target.value)}
                        placeholder="Например: 4"
                    />
                </div>

                {/* Напряжение питания */}
                <div className="space-y-2">
                    <Label>Напряжение питания (В)</Label>
                    <Input
                        type="number"
                        value={voltage}
                        onChange={(e) => setVoltage(e.target.value)}
                        placeholder="Например: 380"
                    />
                </div>

                {/* Количество кранов */}
                <div className="space-y-2">
                    <Label>Количество кранов</Label>
                    <Input
                        type="number"
                        min={0}
                        value={cranes}
                        onChange={(e) => setCranes(e.target.value)}
                        placeholder="Например: 2"
                    />
                </div>

                <Button onClick={submit} className="w-full mt-2">
                    Далее
                </Button>
            </CardContent>
        </Card>
    );
}
