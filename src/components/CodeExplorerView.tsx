import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  FileCode2,
  FolderTree,
  Database,
  Layers,
  Flame,
  Download,
  Terminal,
  FileText,
} from 'lucide-react';
import { FLUTTER_CODE_FILES, FlutterCodeFile } from '../flutterCode/codeFiles';

export const CodeExplorerView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FlutterCodeFile>(FLUTTER_CODE_FILES[0]);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'architecture' | 'firebase_rules'>('files');

  const handleCopy = (content: string, path: string) => {
    navigator.clipboard.writeText(content);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleDownloadAll = () => {
    // Generate a single bundled text file or trigger download
    const bundle = FLUTTER_CODE_FILES.map(
      (f) => `// ==========================================\n// FILE: ${f.path}\n// ${f.description}\n// ==========================================\n\n${f.content}\n\n`
    ).join('\n');

    const blob = new Blob([bundle], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bd_telecom_reseller_flutter_code.dart';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col h-full overflow-hidden">
      {/* Code Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">
                Senior Flutter Architect Source Hub
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-950 text-sky-400 border border-sky-800">
                Flutter 3.24 • Dart 3.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Clean modular architecture with Provider state management & Firebase
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'files' ? 'bg-[#0D47A1] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Dart Files ({FLUTTER_CODE_FILES.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'architecture' ? 'bg-[#0D47A1] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture & Setup</span>
            </button>
            <button
              onClick={() => setActiveTab('firebase_rules')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'firebase_rules' ? 'bg-[#0D47A1] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Firestore Rules</span>
            </button>
          </div>

          <button
            onClick={handleDownloadAll}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All Code</span>
          </button>
        </div>
      </div>

      {activeTab === 'files' && (
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-3 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Project Structure
            </div>
            <div className="p-2 space-y-1">
              {FLUTTER_CODE_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-[#0D47A1] text-white font-bold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider opacity-60 ml-1">
                      {file.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* Active File Header */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Path:</span>
                <span className="font-bold text-sky-400">{selectedFile.path}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 font-sans text-[11px]">{selectedFile.description}</span>
              </div>
              <button
                onClick={() => handleCopy(selectedFile.content, selectedFile.path)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedPath === selectedFile.path ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300 select-text">
              <pre className="whitespace-pre">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-400" />
              Telecom Reseller Architecture Overview
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              This Flutter client application implements a production-grade reseller platform for Bangladesh telecom operations. It isolates business-critical operations like <strong>Flexiload Top-Up</strong> and <strong>Drive Offer Activation</strong> with atomic Firestore transactions and dual-wallet segregation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-sky-400 mb-1">1. Dual-Wallet System</div>
                <p className="text-[11px] text-slate-400">
                  Separates <strong>Main Balance</strong> (used for standard Flexiload top-ups) and <strong>Drive Balance</strong> (reserved for high-commission data and talktime bundles) to protect retailer cashflows.
                </p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-emerald-400 mb-1">2. Biometrics & 6-Digit PIN</div>
                <p className="text-[11px] text-slate-400">
                  Leverages <code>local_auth</code> for fingerprint authentication alongside SHA-256 encrypted 6-digit session PINs and 4-digit transaction authorization.
                </p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-amber-400 mb-1">3. Atomic Balance Deductions</div>
                <p className="text-[11px] text-slate-400">
                  Runs balance checks and ledger updates inside <code>FirebaseFirestore.instance.runTransaction</code> to strictly prevent double-spending or race conditions.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Quick Setup in Your Local Flutter Environment
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
              <li>
                Create a new Flutter app: <code className="text-sky-400 bg-slate-950 px-2 py-0.5 rounded">flutter create --org com.telecomreseller telecom_app</code>
              </li>
              <li>
                Replace <code className="text-sky-400">pubspec.yaml</code> with the provided specification and run <code className="text-sky-400 bg-slate-950 px-2 py-0.5 rounded">flutter pub get</code>.
              </li>
              <li>
                Download <code className="text-amber-400">google-services.json</code> (Android) and <code className="text-amber-400">GoogleService-Info.plist</code> (iOS) from your Firebase Console.
              </li>
              <li>
                Enable <strong>Authentication</strong> (Phone / Email), <strong>Cloud Firestore</strong>, and <strong>Cloud Messaging</strong> in your Firebase project.
              </li>
              <li>
                Copy the modular Dart files from the <strong>Dart Files</strong> tab into your <code className="text-sky-400">lib/</code> directory and run <code className="text-sky-400 bg-slate-950 px-2 py-0.5 rounded">flutter run</code>!
              </li>
            </ol>
          </div>
        </div>
      )}

      {activeTab === 'firebase_rules' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-amber-400" />
              Recommended Cloud Firestore Security Rules (firestore.rules)
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Deploy these security rules to ensure users can only view their own balances and transactions, while preventing unauthorized client-side balance modifications.
            </p>

            <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400 border border-slate-800 overflow-x-auto leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check authentication
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users Collection
    match /users/{userId} {
      // User can read their own profile
      allow read: if isOwner(userId);
      // Only server or atomic transactions can update balance
      allow write: if isOwner(userId) && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['mainBalance', 'driveBalance']);
    }

    // Transactions Collection
    match /transactions/{txnId} {
      // Users can only view their own transactions
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      // Allow user to create pending recharge or add_balance request
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid && request.resource.data.status == 'pending';
      // Only backend daemon or Cloud Functions can approve/cancel transactions
      allow update, delete: if false;
    }

    // Drive Packages Collection (Public Read)
    match /drive_packages/{packId} {
      allow read: if isAuthenticated();
      allow write: if false; // Admin only via backend
    }
  }
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
