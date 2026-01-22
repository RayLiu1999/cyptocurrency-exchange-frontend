import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, ColorType } from 'lightweight-charts';
import { useKlines } from '../hooks/useKlines';

export default function TradingChart() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);

  const { klines, loading } = useKlines('BTC-USD', '1m', 100);

  // 初始化圖表
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0f' },
        textColor: '#8888a0',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'rgba(0, 240, 255, 0.3)',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: 'rgba(0, 240, 255, 0.3)',
          width: 1,
          style: 2,
        },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });

    // v5 API: 使用 chart.addSeries(CandlestickSeries, options)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00ff88',
      downColor: '#ff3366',
      borderDownColor: '#ff3366',
      borderUpColor: '#00ff88',
      wickDownColor: '#ff3366',
      wickUpColor: '#00ff88',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    // 響應式調整
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // 更新 K 線數據
  useEffect(() => {
    if (candleSeriesRef.current && klines.length > 0) {
      candleSeriesRef.current.setData(klines);
      // 滾動到最右邊
      if (chartRef.current) {
        chartRef.current.timeScale().scrollToRealTime();
      }
    }
  }, [klines]);

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      {/* Chart Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-4">
          <button className="px-3 py-1.5 text-sm bg-[var(--accent-glow)] text-[var(--accent-primary)] rounded border border-[var(--border-accent)]">
            1M
          </button>
          {['5M', '15M', '1H', '4H', '1D'].map((tf) => (
            <button
              key={tf}
              className="px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-[var(--text-muted)] text-xs animate-pulse">載入中...</span>
          )}
          <button className="p-2 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative" ref={chartContainerRef}>
        {loading && klines.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
