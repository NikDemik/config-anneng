// src/app/configuration/hooks/useCatalog.ts
'use client';

import { useState, useEffect } from 'react';
import { catalogService, ConfigurationResult } from '../services/catalogService';
import { useConfiguration } from '../context/ConfigurationContext';

export function useCatalog() {
    const { data } = useConfiguration();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [kit, setKit] = useState<ConfigurationResult | null>(null);

    useEffect(() => {
        // Автоматически собираем комплект при наличии расчетов
        if (data.calculations && data.totalPower > 0) {
            buildKit();
        }
    }, [data]);

    const buildKit = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await catalogService.buildKit(data);
            setKit(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка сборки комплекта');
        } finally {
            setLoading(false);
        }
    };

    return {
        kit,
        loading,
        error,
        buildKit,
    };
}
