import { useState, useCallback } from 'react';
import { X, Download, Copy, Check, Database, Code, RefreshCw } from 'lucide-react';
import type { ApiBuilderConfig } from '../../types';
import {
  generateMockData,
  generateSeedScript,
  downloadMockDataJson,
  downloadSeedScript,
} from '../../utils/mockDataGenerator';

interface MockDataModalProps {
  cfg: ApiBuilderConfig;
  onClose: () => void;
}

type Tab = 'data' | 'script';

const MIN_ROWS = 1;
const MAX_ROWS = 20;

export default function MockDataModal({ cfg, onClose }: MockDataModalProps) {
  const [rowCount, setRowCount]   = useState(5);
  const [activeTab, setActiveTab] = useState<Tab>('data');
  const [copied, setCopied]       = useState(false);

  // Re-generate whenever rowCount changes
  const mockData = generateMockData(cfg, rowCount);
  const seedScript = generateSeedScript(cfg, mockData);

  const handleCopy = useCallback(() => {
    const text = activeTab === 'data'
      ? JSON.stringify(mockData, null, 2)
      : seedScript;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeTab, mockData, seedScript]);

  const tableNames = Object.keys(mockData);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60" style={{ zIndex: 60 }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Mock Data Simulator</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Generate sample data and a localStorage seed script for offline / local development.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-500" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls bar */}
        <div className="flex items-center gap-4 px-6 py-3 border-b bg-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Rows per table:
            </label>
            <input
              type="range"
              min={MIN_ROWS}
              max={MAX_ROWS}
              value={rowCount}
              onChange={(e) => setRowCount(Number(e.target.value))}
              className="w-28 accent-blue-600"
            />
            <span className="text-sm font-mono text-gray-700 w-5 text-right">{rowCount}</span>
          </div>

          <div className="flex-1" />

          {/* Tabs */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'data'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Data JSON
            </button>
            <button
              onClick={() => setActiveTab('script')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'script'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Seed Script
            </button>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            title="Copy to clipboard"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {activeTab === 'data' ? (
            <DataTab mockData={mockData} tableNames={tableNames} />
          ) : (
            <ScriptTab seedScript={seedScript} cfg={cfg} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t shrink-0">
          <p className="text-xs text-gray-400">
            {tableNames.length} table{tableNames.length !== 1 ? 's' : ''} · {rowCount} row{rowCount !== 1 ? 's' : ''} each ·{' '}
            {tableNames.reduce((acc, k) => acc + mockData[k].length, 0)} total records
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => downloadMockDataJson(cfg, mockData)}
              title="Download mock data as JSON"
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download JSON
            </button>
            <button
              onClick={() => downloadSeedScript(cfg, mockData)}
              title="Download localStorage seed script"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Seed Script (.js)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Data tab ─────────────────────────────────────────────────────────────────

interface DataTabProps {
  mockData: Record<string, unknown[]>;
  tableNames: string[];
}

function DataTab({ mockData, tableNames }: DataTabProps) {
  const [selectedTable, setSelectedTable] = useState(tableNames[0] ?? '');

  // Keep selection valid when tables change
  const table = tableNames.includes(selectedTable) ? selectedTable : (tableNames[0] ?? '');
  const rows  = mockData[table] ?? [];

  if (tableNames.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        No tables defined yet.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Table selector */}
      {tableNames.length > 1 && (
        <div className="flex gap-1 px-6 pt-3 pb-0 border-b shrink-0 overflow-x-auto">
          {tableNames.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedTable(name)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t-lg border border-b-0 transition-colors ${
                name === table
                  ? 'bg-white border-gray-300 text-blue-600 -mb-px z-10'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {name} ({mockData[name]?.length ?? 0})
            </button>
          ))}
        </div>
      )}

      {/* JSON preview */}
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg p-4 leading-relaxed">
          {JSON.stringify(rows, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// ─── Script tab ───────────────────────────────────────────────────────────────

interface ScriptTabProps {
  seedScript: string;
  cfg: ApiBuilderConfig;
}

function ScriptTab({ seedScript, cfg }: ScriptTabProps) {
  const svcCamel  = cfg.serviceName.charAt(0).toLowerCase() + cfg.serviceName.slice(1);
  const basePath  = `${cfg.baseUrl.replace(/\/$/, '')}/${cfg.version}/${svcCamel}`;
  const lsKey     = `mock__${cfg.serviceName}`;
  const fileName  = `${cfg.serviceName.toLowerCase()}-mock-sim.js`;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto">
      {/* Info card */}
      <div className="mx-6 mt-4 mb-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700 space-y-1 shrink-0">
        <p>
          <strong>1. Add this script</strong> to your HTML{' '}
          <code className="bg-blue-100 px-1 rounded">&lt;head&gt;</code> before
          any API calls:
        </p>
        <p>
          <code className="bg-blue-100 px-1 rounded break-all">
            {`<script src="${fileName}"></script>`}
          </code>
        </p>
        <p>
          <strong>2. All fetch calls</strong> to{' '}
          <code className="bg-blue-100 px-1 rounded break-all">{basePath}/…</code>{' '}
          will be intercepted and served from localStorage (key:{' '}
          <code className="bg-blue-100 px-1 rounded">{lsKey}</code>).
        </p>
        <p>
          <strong>3. Reset data</strong> in the browser console:{' '}
          <code className="bg-blue-100 px-1 rounded">
            {`localStorage.removeItem('${lsKey}')`}
          </code>
        </p>
        <p className="flex items-center gap-1">
          <RefreshCw className="w-3 h-3 shrink-0" />
          Write operations (POST, PUT, DELETE) are persisted back to localStorage automatically.
        </p>
      </div>

      {/* Script preview */}
      <div className="flex-1 overflow-auto px-6 pb-4">
        <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg p-4 leading-relaxed">
          {seedScript}
        </pre>
      </div>
    </div>
  );
}
