// src/app/configuration/ConfigurationSteps.tsx
'use client';

import { useConfiguration } from './context/ConfigurationContext';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';

export default function ConfigurationSteps() {
    const { currentStep } = useConfiguration();

    switch (currentStep) {
        case 1:
            return <Step1 />;
        case 2:
            return <Step2 />;
        case 3:
            return <Step3 />;
        default:
            return null;
    }
}
