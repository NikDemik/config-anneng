// src/app/configuration/utils/generatePDF.ts

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ConfigurationResult } from '../services/catalogService';
import { ConfigurationData } from '../steps/shared/types';

/**
 * Загрузка Roboto из public/fonts
 */
async function loadRobotoFont(doc: jsPDF) {
    const response = await fetch('/fonts/roboto/Roboto-Regular.ttf');
    const buffer = await response.arrayBuffer();

    const base64 = arrayBufferToBase64(buffer);

    doc.addFileToVFS('Roboto-Regular.ttf', base64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto', 'normal');
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}

/**
 * Генерация PDF
 */
export async function generateSpecificationPDF(
    kit: ConfigurationResult,
    configData: ConfigurationData,
) {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    // 🔥 обязательно ДО любого текста
    await loadRobotoFont(doc);

    doc.setFont('Roboto');
    doc.setFontSize(20);
    doc.text('СПЕЦИФИКАЦИЯ РАСЧЕТ ШИНОПРОВОДА', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 20, 30);
    doc.text(`Время: ${new Date().toLocaleTimeString('ru-RU')}`, 20, 37);

    doc.setFontSize(14);
    doc.text('Параметры конфигурации:', 20, 50);

    doc.setFontSize(11);
    doc.text(`• Длина линии: ${configData.length} м`, 25, 60);
    doc.text(`• Количество жил: ${configData.poles}`, 25, 67);
    doc.text(`• Напряжение: ${configData.voltage} В`, 25, 74);
    doc.text(`• Количество потребителей: ${configData.totalConsumers}`, 25, 81);
    doc.text(`• Общая мощность: ${configData.totalPower} кВт`, 25, 88);
    doc.text(`• Расчетный ток: ${configData.calculations?.totalCurrent} А`, 25, 95);

    let yPos = 110;

    // ======================
    // Секции
    // ======================

    doc.setFontSize(14);
    doc.text('Секции шинопровода:', 20, yPos);
    yPos += 8;

    autoTable(doc, {
        startY: yPos,
        head: [['Наименование', 'Кол-во', 'Цена', 'Сумма']],
        body: [
            [
                kit.components.sections[0]?.name || 'Секция',
                kit.totals.sectionsCount.toString(),
                formatPrice(kit.components.sections[0]?.price || 0),
                formatPrice(kit.totals.sectionsPrice),
            ],
        ],
        styles: {
            font: 'Roboto', // 🔥 КЛЮЧЕВОЕ
            fontStyle: 'normal',
            fontSize: 10,
        },
        headStyles: {
            font: 'Roboto',
            fontStyle: 'normal',
            fillColor: [41, 128, 185],
            textColor: 255,
        },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // ======================
    // Комплектующие
    // ======================

    doc.setFontSize(14);
    doc.text('Комплектующие:', 20, yPos);
    yPos += 8;

    // Список ключей комплектующих, которые нужно исключить из общего списка
    const excludeFromAccessories = ['currentCollectors'];

    const accessoriesData: any[] = [];

    Object.entries(kit.totals.accessoriesCount)
        .filter(([key]) => !excludeFromAccessories.includes(key))
        .forEach(([key, count]) => {
            if (count === 0) return;

            const component = kit.components[key as keyof typeof kit.components]?.[0];
            const price =
                kit.totals.accessoriesPrice[key as keyof typeof kit.totals.accessoriesPrice];

            if (component) {
                accessoriesData.push([
                    component.name,
                    count.toString(),
                    formatPrice(component.price),
                    formatPrice(price),
                ]);
            }
        });

    if (accessoriesData.length > 0) {
        autoTable(doc, {
            startY: yPos,
            head: [['Наименование', 'Кол-во', 'Цена', 'Сумма']],
            body: accessoriesData,
            styles: {
                font: 'Roboto', // 🔥 обязательно
                fontStyle: 'normal',
                fontSize: 10,
            },
            headStyles: {
                font: 'Roboto',
                fontStyle: 'normal',
                fillColor: [41, 128, 185],
                textColor: 255,
            },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // ======================
    // Токосъемники
    // ======================

    doc.setFontSize(14);
    doc.text('Токосъемники:', 20, yPos);
    yPos += 8;

    const collecotorsData: any[] = [];

    Object.entries(kit.totals.collectorDetails.collectorsByType).forEach(
        ([key, data]: [string, any]) => {
            if (data === 0) return;

            // const component = kit.components[key as keyof typeof kit.components]?.[0];
            // const price =
            //     kit.totals.accessoriesPrice[key as keyof typeof kit.totals.accessoriesPrice];

            if (data.component) {
                collecotorsData.push([
                    data.component.name,
                    data.count.toString(),
                    formatPrice(data.component.price),
                    formatPrice(data.price * data.count),
                ]);
            }
        },
    );

    if (collecotorsData.length > 0) {
        autoTable(doc, {
            startY: yPos,
            head: [['Наименование', 'Кол-во', 'Цена', 'Сумма']],
            body: collecotorsData,
            styles: {
                font: 'Roboto', // 🔥 обязательно
                fontStyle: 'normal',
                fontSize: 10,
            },
            headStyles: {
                font: 'Roboto',
                fontStyle: 'normal',
                fillColor: [41, 128, 185],
                textColor: 255,
            },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // ======================
    // Итог
    // ======================

    doc.setFontSize(16);
    doc.setTextColor(0, 100, 0);
    doc.text(`ИТОГО: ${formatPrice(kit.totals.totalPrice)}`, 20, yPos);

    return doc;
}

/**
 * Сохранение
 */
export async function downloadSpecificationPDF(
    kit: ConfigurationResult,
    configData: ConfigurationData,
) {
    const doc = await generateSpecificationPDF(kit, configData);

    const fileName = `specification-${new Date().toISOString().slice(0, 10)}.pdf`;

    doc.save(fileName);
}

/**
 * Форматирование цены
 */
function formatPrice(value: number) {
    return `${value.toLocaleString('ru-RU')} ₽`;
}
