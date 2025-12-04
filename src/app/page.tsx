import Link from 'next/link';
import { ArrowUpRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
                <div className="flex items-start gap-2">
                    <Button variant="outline">
                        <Link href="/configurator">Открыть конфигуратор</Link>
                    </Button>
                    <Button size="icon" aria-label="Submit" variant="outline">
                        <Link href="/configurator">
                            <ArrowUpRightIcon />
                        </Link>
                    </Button>
                </div>
            </main>
        </div>
    );
}
