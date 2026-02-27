// src/app/configuration/utils/generatePDF.ts

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ConfigurationResult } from '../services/catalogService';
import { ConfigurationData } from '../steps/shared/types';
import { loadRobotoFont } from '@/lib/pdf/loadRobotoFont';

/* ===============================
    Водяной знак (тайловый)
================================= */
function drawWatermark(doc: jsPDF, text: string) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.saveGraphicsState();

    // Прозрачность
    doc.setGState(new doc.GState({ opacity: 0.06 }));

    doc.setFont('Roboto');
    doc.setFontSize(20);
    doc.setTextColor(150, 150, 150);

    const stepX = 100;
    const stepY = 40;

    for (let y = 0; y < pageHeight + stepY; y += stepY) {
        for (let x = -50; x < pageWidth + stepX; x += stepX) {
            doc.text(text, x, y, {
                angle: 45,
            });
        }
    }

    doc.restoreGraphicsState();
}

/* ===============================
    watermark-изображения
================================= */

async function drawImageWatermark(doc: jsPDF) {
    const imgUrl = '/logo/anneng.png';
    const response = await fetch(imgUrl);
    const blob = await response.blob();

    const base64 = await blobToBase64(blob);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.saveGraphicsState();

    // прозрачность
    doc.setGState(new doc.GState({ opacity: 0.08 }));

    // масштабируем под страницу
    const imgWidth = pageWidth * 0.4;
    const imgHeight = imgWidth * 0.3;

    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    doc.addImage(base64, 'PNG', x, y, imgWidth, imgHeight);

    doc.restoreGraphicsState();
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}

/* ===============================
    Форматирование цены
================================= */
function formatPrice(value: number) {
    return `${value.toLocaleString('ru-RU')} ₽`;
}

/* ===============================
    Генерация PDF
================================= */
export async function generateSpecificationPDF(
    kit: ConfigurationResult,
    configData: ConfigurationData,
) {
    const doc = new jsPDF({
        orientation: 'portrait', // landscape если альбомная
        unit: 'mm',
        format: 'a4',
    });

    await loadRobotoFont(doc);

    // watermark первой страницы
    await drawImageWatermark(doc);

    doc.setFont('Roboto');
    doc.setFontSize(16);
    doc.text('Спецификация подбора шинопровода', 105, 20, { align: 'center' });
    doc.text(
        `и комплектующих под рассчетный ток ${configData.calculations?.totalCurrent} А, длинной ${configData.length} м`,
        105,
        27,
        { align: 'center' },
    );

    doc.setFontSize(10);
    doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 20, 36);
    doc.text(`Время: ${new Date().toLocaleTimeString('ru-RU')}`, 20, 40);

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

    /* ===============================
        Секции
  ================================= */
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
            font: 'Roboto',
            fontStyle: 'normal',
            fontSize: 10,
        },
        headStyles: {
            font: 'Roboto',
            fillColor: [41, 128, 185],
            textColor: 255,
        },
        // didDrawPage: () => {
        //     drawWatermark(doc, 'ООО "ТРОЛЛЕЙНЫЙ ШИНОПРОВОД" СЕКЦИИ');
        // },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    /* ===============================
        Комплектующие
  ================================= */
    doc.setFontSize(14);
    doc.text('Комплектующие:', 20, yPos);
    yPos += 8;

    // Список ключей комплектующих, которые нужно исключить из общего списка
    const excludeFromAccessories = ['currentCollectors'];

    const accessoriesData: any[] = [];

    Object.entries(kit.totals.accessoriesCount).filter(([key]) => !excludeFromAccessories.includes(key)).forEach(([key, count]) => {
        if (count === 0) return;

        const component = kit.components[key as keyof typeof kit.components]?.[0];
        const price = kit.totals.accessoriesPrice[key as keyof typeof kit.totals.accessoriesPrice];

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
                font: 'Roboto',
                fontStyle: 'normal',
                fontSize: 10,
            },
            headStyles: {
                font: 'Roboto',
                fillColor: [41, 128, 185],
                textColor: 255,
            },
            // didDrawPage: () => {
            //     drawWatermark(doc, 'ООО "ТРОЛЛЕЙНЫЙ ШИНОПРОВОД" КОМПЛЕКТУЮЩИЕ');
            // },
        });
    }

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // ======================
    // Токосъемники
    // ======================
    // doc.addPage();
    doc.setFontSize(14);
    doc.text('Токосъемники:', 20, yPos);
    yPos += 8;
    
    const collectorsData: any[] = [];

    {/* Если есть индивидуальные потребители */}
    if (kit.totals.collectorDetails?.type === 'individual') {
        
        Object.entries(kit.totals.collectorDetails.collectorsByType).forEach(
            ([key, data]: [string, any]) => {
                if (!data || data.count === 0) return;

                if (data.component) {
                    collectorsData.push([
                        data.component.name,
                        data.count.toString(),
                        formatPrice(data.component.price),
                        formatPrice(data.component.price * data.count),
                    ]);
                }
            },
        )
    } else {
        const component = kit.components.currentCollectors[0];
        const price = kit.components.currentCollectors[0]?.price ?? 0;
        const count = kit.totals.accessoriesCount.currentCollectors;
    
        if (component) {
            collectorsData.push([
                component.name,
                count.toString(),
                formatPrice(component.price),
                formatPrice(price * count),
            ]);    

        }
    }

    if (collectorsData.length > 0) {
        autoTable(doc, {
            startY: yPos,
            head: [['Наименование', 'Кол-во', 'Цена', 'Сумма']],
            body: collectorsData,
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
            pageBreak: 'avoid',
            // didDrawPage: () => {
            //     drawWatermark(doc, 'ТОКОСЪЕМНИКИ');
            // },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    yPos = (doc as any).lastAutoTable.finalY + 20;

    doc.setFontSize(16);
    doc.setTextColor(0, 100, 0);
    doc.text(`ИТОГО: ${formatPrice(kit.totals.totalPrice)}`, 20, yPos, { align: 'left' });

    return doc;
}

/* ===============================
    Сохранение
================================= */
export async function downloadSpecificationPDF2(
    kit: ConfigurationResult,
    configData: ConfigurationData,
) {
    const doc = await generateSpecificationPDF(kit, configData);

    const fileName = `specification-${new Date().toISOString().slice(0, 10)}.pdf`;

    doc.save(fileName);
}
