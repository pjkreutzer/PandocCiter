// Adapter to abstract editor host APIs (VS Code <-> Zed)
import * as vscode from 'vscode';

// Try to detect a Zed host if available at runtime. Zed exposes its API either via a global
// `zed` object or via a require('zed') in dev environments. This adapter falls back to
// the VS Code API when run inside VS Code so the codebase remains compatible with both hosts.
let zed: any;
try {
  zed = (globalThis as any).zed || (typeof require !== 'undefined' ? require('zed') : undefined);
} catch (e) {
  zed = undefined;
}

const hasVscode = typeof vscode !== 'undefined' && vscode != null;

export const host = {
  workspace: hasVscode ? vscode.workspace : (zed && zed.workspace),
  window: hasVscode ? vscode.window : (zed && zed.window),
  languages: hasVscode ? vscode.languages : (zed && zed.languages),

  createOutputChannel: (name: string) => {
    if (hasVscode) return vscode.window.createOutputChannel(name);
    if (zed && zed.window && typeof zed.window.createOutputChannel === 'function') return zed.window.createOutputChannel(name);
    // fallback stub
    return {
      append: (_: string) => {},
      appendLine: (_: string) => {},
      show: () => {},
    } as any;
  },

  getConfiguration: (section: string) => {
    if (hasVscode) return vscode.workspace.getConfiguration(section);
    if (zed && zed.workspace && typeof zed.workspace.getConfiguration === 'function') return zed.workspace.getConfiguration(section);
    return { get: (_k: string) => undefined } as any;
  },

  onDidOpenTextDocument: (cb: any) => {
    if (hasVscode) return vscode.workspace.onDidOpenTextDocument(cb);
    if (zed && zed.workspace && zed.workspace.onDidOpenTextDocument) return zed.workspace.onDidOpenTextDocument(cb);
    return { dispose() {} } as any;
  },

  onDidSaveTextDocument: (cb: any) => {
    if (hasVscode) return vscode.workspace.onDidSaveTextDocument(cb);
    if (zed && zed.workspace && zed.workspace.onDidSaveTextDocument) return zed.workspace.onDidSaveTextDocument(cb);
    return { dispose() {} } as any;
  },

  onDidChangeActiveTextEditor: (cb: any) => {
    if (hasVscode) return vscode.window.onDidChangeActiveTextEditor(cb);
    if (zed && zed.window && zed.window.onDidChangeActiveTextEditor) return zed.window.onDidChangeActiveTextEditor(cb);
    return { dispose() {} } as any;
  },

  registerCompletionItemProvider: (selector: any, provider: any, trigger?: string) => {
    if (hasVscode) return vscode.languages.registerCompletionItemProvider(selector, provider, trigger);
    if (zed && zed.languages && zed.languages.registerCompletionItemProvider) return zed.languages.registerCompletionItemProvider(selector, provider, trigger);
    return { dispose() {} } as any;
  },

  registerHoverProvider: (selector: any, provider: any) => {
    if (hasVscode) return vscode.languages.registerHoverProvider(selector, provider);
    if (zed && zed.languages && zed.languages.registerHoverProvider) return zed.languages.registerHoverProvider(selector, provider);
    return { dispose() {} } as any;
  },

  registerDefinitionProvider: (selector: any, provider: any) => {
    if (hasVscode) return vscode.languages.registerDefinitionProvider(selector, provider);
    if (zed && zed.languages && zed.languages.registerDefinitionProvider) return zed.languages.registerDefinitionProvider(selector, provider);
    return { dispose() {} } as any;
  },

  activeTextEditor: () => {
    if (hasVscode) return vscode.window.activeTextEditor;
    if (zed && zed.window) return zed.window.activeTextEditor;
    return undefined;
  }
};

export type Host = typeof host;
