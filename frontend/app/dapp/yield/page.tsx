"use client";

import { useEffect, useState } from "react";
import { Zap, Coins, Trophy, Sparkles, PieChart, Activity, RefreshCcw, Landmark } from "lucide-react";
import { HEADING_FONT, LABEL_MONO } from "@/components/dapp/ArtelHeader";
import { artelClient, CONTRACT_IDS } from "@/lib/artel-sdk";
import { scValToNative } from "@stellar/stellar-sdk";

export default function YieldPage() {
  const [blendStats, setBlendStats] = useState({ staked: "0.0", yield: "0.00", gacha: "0.00", monthly: "0.00" });

  useEffect(() => {
    const fetchBlend = async () => {
      try {
        const scval = await artelClient.getArisanState(CONTRACT_IDS.pool);
        if (scval) {
          const native = scValToNative(scval);
          const totalStaked = Number(native.blend_btoken_balance) / 10000000;
          const gacha = Number(native.yield_balance) / 10000000;
          const totalYield = gacha * 4; // 100% of collateral yield
          const monthlyYield = Number(native.collateral_yield_balance) / 10000000; 
          
          setBlendStats({
            staked: totalStaked.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
            yield: totalYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            gacha: gacha.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            monthly: monthlyYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchBlend();
    const iv = setInterval(fetchBlend, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-screen px-5 pb-20 pt-24 md:px-10 lg:px-12 bg-[#f0ead2]">
      <div className="mx-auto max-w-5xl">
        {/* Hero Section */}
        <div className="border-[4px] border-[#0a0a0a] bg-[var(--color-sui)] p-8 md:p-12 shadow-[12px_12px_0_#0a0a0a] relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 border-[2px] border-[#0a0a0a] bg-white px-3 py-1 mb-6">
                <Zap className="size-4 text-[#f59e0b]" />
                <span className="text-xs font-black tracking-wider uppercase" style={LABEL_MONO}>Powered by Blend Protocol</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black leading-[0.95] text-[#0a0a0a]" style={HEADING_FONT}>
                Triple Yield Engine.
              </h1>
              <p className="mt-4 text-lg font-bold text-[#0a0a0a] max-w-lg">
                Uang yang Anda simpan di ARTEL tidak pernah diam. Kami memutar dana Anda di Stellar DeFi ecosystem untuk menghasilkan bunga berkelanjutan melalui tiga pilar distribusi.
              </p>
            </div>
            
            {/* Realtime Stats Box */}
            <div className="shrink-0 w-full md:w-72 border-[3px] border-[#0a0a0a] bg-white p-5 shadow-[6px_6px_0_#0a0a0a]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-sm uppercase tracking-widest" style={LABEL_MONO}>Live On-Chain Data</h3>
                <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[#555]">Total TVL di Blend</p>
                  <p className="text-2xl font-black text-[#38bdf8]">{blendStats.staked} XLM</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#555]">Total Yield Dihasilkan</p>
                  <p className="text-2xl font-black text-[#14b8a6]">+{blendStats.yield} XLM</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative background shapes */}
          <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-white opacity-20 blur-3xl pointer-events-none" />
          <div className="absolute top-10 right-1/3 size-32 bg-[#f59e0b] opacity-20 rotate-45 blur-2xl pointer-events-none" />
        </div>

        <div className="mt-16 mb-8 flex items-center gap-4">
          <PieChart className="size-8 text-[#0a0a0a]" />
          <h2 className="text-3xl font-black" style={HEADING_FONT}>Mekanisme Pembagian Yield</h2>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Pillar 1 */}
          <div className="border-[3px] border-[#0a0a0a] bg-white p-6 shadow-[8px_8px_0_#0a0a0a] flex flex-col hover:-translate-y-1 hover:shadow-[12px_12px_0_#0a0a0a] transition-all">
            <div className="size-12 border-[2px] border-[#0a0a0a] bg-[#38bdf8] flex items-center justify-center mb-6">
              <Coins className="size-6 text-[#0a0a0a]" />
            </div>
            <h3 className="text-2xl font-black mb-3" style={HEADING_FONT}>1. Yield Kolateral (Merata)</h3>
            <p className="text-[#444] font-semibold text-sm flex-1 leading-relaxed">
              Bunga langsung yang dihasilkan dari dana kolateral awal Anda. Sebanyak 75% dari total bunga kolateral ini dibagikan secara adil dan merata ke seluruh anggota aktif per putaran.
            </p>
            <div className="mt-6 pt-4 border-t-2 border-dashed border-[#0a0a0a]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#38bdf8]" style={LABEL_MONO}>Alokasi: 75% DARI YIELD TOTAL</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="border-[3px] border-[#0a0a0a] bg-white p-6 shadow-[8px_8px_0_#0a0a0a] flex flex-col hover:-translate-y-1 hover:shadow-[12px_12px_0_#0a0a0a] transition-all">
            <div className="size-12 border-[2px] border-[#0a0a0a] bg-[#f59e0b] flex items-center justify-center mb-6">
              <RefreshCcw className="size-6 text-[#0a0a0a]" />
            </div>
            <h3 className="text-2xl font-black mb-3" style={HEADING_FONT}>2. Yield Iuran Bulanan</h3>
            <p className="text-[#444] font-semibold text-sm flex-1 leading-relaxed">
              Iuran peserta di pool tidak menganggur sebelum undian. Dana ini distaking ke Blend, dan bunganya (Yield Kumulatif) bersifat dinamis. Proses penarikannya dilakukan pada akhir periode Pool, bisa 1 bulan, 6 bulan, dst tergantung dari durasi Pool yang ditentukan.
            </p>
            <div className="mt-6 pt-4 border-t-2 border-dashed border-[#0a0a0a]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#f59e0b]" style={LABEL_MONO}>Live Vault: {blendStats.monthly} XLM</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="border-[3px] border-[#0a0a0a] bg-white p-6 shadow-[8px_8px_0_#0a0a0a] flex flex-col hover:-translate-y-1 hover:shadow-[12px_12px_0_#0a0a0a] transition-all">
            <div className="size-12 border-[2px] border-[#0a0a0a] bg-[#ec4899] flex items-center justify-center mb-6">
              <Trophy className="size-6 text-[#0a0a0a]" />
            </div>
            <h3 className="text-2xl font-black mb-3" style={HEADING_FONT}>3. Gacha Akhir Periode</h3>
            <p className="text-[#444] font-semibold text-sm flex-1 leading-relaxed">
              Sebanyak 25% dari yield kolateral dikumpulkan ke dalam pot Gacha khusus setiap akhir tahun. Di akhir siklus Arisan/akhir tahun, pot ini diundi menggunakan Point/Ticket system ke peserta dengan reputasi terbaik!
            </p>
            <div className="mt-6 pt-4 border-t-2 border-dashed border-[#0a0a0a]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#ec4899]" style={LABEL_MONO}>Alokasi: 25% SETIAP AKHIR TAHUN</span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-12 border-[3px] border-[#0a0a0a] bg-[#fef9c3] p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="size-16 shrink-0 border-[2px] border-[#0a0a0a] bg-white rounded-full flex items-center justify-center">
            <Landmark className="size-8 text-[#0a0a0a]" />
          </div>
          <div>
            <h4 className="font-black text-xl mb-1" style={HEADING_FONT}>Transparansi Penuh (Blockchain-verified)</h4>
            <p className="text-sm font-semibold text-[#333]">
              Seluruh proses penarikan, suplai, dan pembagian bunga dieksekusi secara otomatis oleh smart contract di jaringan Stellar. Tidak ada sentralisasi data; semua aset dan angka dapat diverifikasi melalui Stellar Explorer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
