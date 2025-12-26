import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-slate/10">
      <div className="max-w-[1200px] mx-auto text-center">
        <div className="flex items-center justify-center gap-2 text-slate/60 text-sm">
          <Heart className="w-4 h-4 text-accent fill-accent" />
          <span>2024</span>
        </div>
        <p className="text-xs text-slate/40 mt-2">
          Özlem & Zübeyir Düğün Arşivi • Nusaybin
        </p>
      </div>
    </footer>
  );
}
