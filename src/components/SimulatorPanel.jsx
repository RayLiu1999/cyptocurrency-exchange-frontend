import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { startSimulation, stopSimulation, getSimulationStatus, clearSimulationData } from '../services/api';

export default function SimulatorPanel({ currentSymbol = 'BTC-USD', showToast }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    // 設定
    const [config, setConfig] = useState({
        numTraders: 20,
        totalTx: 1000,
        workerCount: 5,
        intervalMs: 300 // 預設放慢一點
    });

    // 輪詢狀態：開啟視窗時，或模擬器正在運行時，都要輪詢
    useEffect(() => {
        let interval;
        if (isOpen || isRunning) {
            fetchStatus();
            interval = setInterval(fetchStatus, 2000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOpen, isRunning]);

    const fetchStatus = async () => {
        try {
            const data = await getSimulationStatus();
            setStatus(data);
            setIsRunning(data.running || false);
        } catch {
            // 模擬器未啟用，不顯示錯誤
            setIsRunning(false);
            setStatus(null);
        }
    };

    const handleStart = async () => {
        setLoading(true);
        try {
            // 根據當前交易對設定基礎價格
            const basePrice = currentSymbol === 'ETH-USD' ? 3000 : 67000;
            
            await startSimulation({
                symbol: currentSymbol,
                basePrice: basePrice,
                numTraders: config.numTraders,
                totalTx: config.totalTx,
                workerCount: config.workerCount,
                intervalMs: config.intervalMs
            });
            
            showToast?.(`模擬交易已啟動！${config.numTraders} 個機器人正在交易 ${currentSymbol}`, 'success');
            setIsRunning(true);
            setIsOpen(false); // 啟動後關閉視窗，讓使用者看大盤
            await fetchStatus();
        } catch (err) {
            showToast?.(err.error || '啟動模擬失敗', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        setLoading(true);
        try {
            await stopSimulation();
            showToast?.('模擬交易已停止', 'info');
            setIsRunning(false);
            await fetchStatus();
        } catch (err) {
            showToast?.(err.error || '停止模擬失敗', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClearData = async () => {
        if (!window.confirm('確定要清除所有交易資料嗎？這將刪除所有訂單與成交紀錄。')) return;
        setLoading(true);
        try {
            await clearSimulationData();
            showToast?.('交易資料已清除', 'success');
            await fetchStatus();
            // 強制重新整理頁面以更新餘額和列表
            window.location.reload();
        } catch (err) {
            showToast?.(err.error || '清除資料失敗', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* 觸發按鈕 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isRunning 
                        ? 'bg-[var(--green-muted)] border border-[var(--green-up)] text-[var(--green-up)]' 
                        : 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)]'
                }`}
                title="模擬交易控制"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-display font-semibold text-sm">模擬器</span>
                {isRunning && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--green-up)] rounded-full animate-pulse" />
                )}
            </button>

            {/* 控制面板 */}
            {isOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="relative glass-panel w-full max-w-md p-6 animate-fade-in">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <h3 className="text-xl font-display font-bold">模擬交易</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Status */}
                        {status && (
                            <div className="mb-6 p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-[var(--text-muted)]">狀態</span>
                                        <div className={`font-mono font-semibold ${isRunning ? 'text-[var(--green-up)]' : 'text-[var(--text-muted)]'}`}>
                                            {isRunning ? '● 運作中' : '○ 已停止'}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[var(--text-muted)]">交易對</span>
                                        <div className="font-mono font-semibold">{status.symbol || '-'}</div>
                                    </div>
                                    <div>
                                        <span className="text-[var(--text-muted)]">已完成</span>
                                        <div className="font-mono font-semibold">{status.sent_tx || 0}</div>
                                    </div>
                                    <div>
                                        <span className="text-[var(--text-muted)]">總計</span>
                                        <div className="font-mono font-semibold">{status.total_tx || 0}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Configuration */}
                        {!isRunning && (
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-[var(--text-muted)] text-sm mb-2 block">交易對</label>
                                    <div className="px-4 py-2 rounded-lg bg-[var(--bg-elevated)] font-mono text-[var(--accent-primary)]">
                                        {currentSymbol}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[var(--text-muted)] text-sm mb-2 block">機器人數量</label>
                                    <input
                                        type="number"
                                        value={config.numTraders}
                                        onChange={(e) => setConfig({...config, numTraders: parseInt(e.target.value) || 20})}
                                        className="input-field w-full"
                                        min="2"
                                        max="100"
                                    />
                                </div>

                                <div>
                                    <label className="text-[var(--text-muted)] text-sm mb-2 block">總交易數</label>
                                    <input
                                        type="number"
                                        value={config.totalTx}
                                        onChange={(e) => setConfig({...config, totalTx: e.target.value === '' ? '' : parseInt(e.target.value)})}
                                        className="input-field w-full"
                                        min="10"
                                        max="10000"
                                    />
                                </div>

                                <div>
                                    <label className="text-[var(--text-muted)] text-sm mb-2 block">併發數 (Worker)</label>
                                    <input
                                        type="number"
                                        value={config.workerCount}
                                        onChange={(e) => setConfig({...config, workerCount: parseInt(e.target.value) || 5})}
                                        className="input-field w-full"
                                        min="1"
                                        max="20"
                                    />
                                </div>

                                <div>
                                    <label className="text-[var(--text-muted)] text-sm mb-2 block flex justify-between">
                                        <span>發單間隔 (ms)</span>
                                        <span className="text-[var(--accent-primary)] font-mono">{config.intervalMs} ms</span>
                                    </label>
                                    <input
                                        type="range"
                                        value={config.intervalMs}
                                        onChange={(e) => setConfig({...config, intervalMs: parseInt(e.target.value) || 0})}
                                        className="w-full accent-[var(--accent-primary)]"
                                        min="0"
                                        max="1000"
                                        step="50"
                                    />
                                    <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
                                        <span>極速 (0ms)</span>
                                        <span>慢速 (1s)</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Warning */}
                        <div className="mb-6 p-3 rounded-lg bg-[rgba(255,200,0,0.1)] border border-[rgba(255,200,0,0.3)]">
                            <p className="text-xs text-[#ffc800] flex items-start gap-2">
                                <span className="text-base">⚠</span>
                                <span>模擬交易將建立大量訂單，可能影響真實交易。建議在測試環境使用。</span>
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {!isRunning ? (
                                <button
                                    onClick={handleStart}
                                    disabled={loading}
                                    className="flex-1 py-3 px-4 rounded-lg bg-[var(--green-up)] text-[var(--bg-void)] font-display font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>啟動中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>啟動模擬</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={handleStop}
                                    disabled={loading}
                                    className="flex-1 py-3 px-4 rounded-lg bg-[var(--red-down)] text-white font-display font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>停止中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                            </svg>
                                            <span>停止模擬</span>
                                        </>
                                    )}
                                </button>
                            )}
                            
                            {/* Clear Data Button (Always visible when not running) */}
                            {!isRunning && (
                                <button
                                    onClick={handleClearData}
                                    disabled={loading}
                                    className="py-3 px-4 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-all flex items-center justify-center"
                                    title="清除所有交易數據"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>,
                document.getElementById('modal-root') || document.body
            )}
        </>
    );
}
