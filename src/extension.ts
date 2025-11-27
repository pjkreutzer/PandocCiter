import * as vscode from 'vscode';
import { Manager } from './components/manager';
import { Completer } from './providers/completion';
import { HoverProvider } from './providers/hover';
import { DefinitionProvider } from './providers/definition';
import { host } from './adapters/host';

export function activate(context: any) {
  const extension = new Extension();

  context.subscriptions.push(
    host.onDidOpenTextDocument(() => {
      extension.log('Reacting to document open');
      if (host.activeTextEditor()) {
        extension.manager.findBib();
      }
    })
  );

  context.subscriptions.push(
    host.onDidChangeActiveTextEditor(() => {
      extension.log('Reacting to active document change');
      const editor = host.activeTextEditor();
      if (
        editor &&
        ['markdown', 'rmd', 'pweave_md'].includes(editor.document.languageId)
      ) {
        extension.manager.findBib();
      }
    })
  );

  context.subscriptions.push(
    host.onDidSaveTextDocument(() => {
      extension.log('Reacting to document save');
      if (host.activeTextEditor()) {
        extension.manager.findBib();
      }
    })
  );

  const selector = ['markdown', 'rmd', 'pweave_md', 'quarto'].map(language => {
    return { scheme: 'file', language: language };
  });

  extension.manager.findBib();
  context.subscriptions.push(
    host.registerCompletionItemProvider(
      selector,
      extension.completer,
      '@'
    )
  );
  context.subscriptions.push(host.registerHoverProvider(selector, extension.hover));
  context.subscriptions.push(host.registerDefinitionProvider(selector, extension.definition));
}

export class Extension {
  manager: Manager;
  completer: Completer;
  hover: HoverProvider;
  definition: DefinitionProvider;
  logPanel: any;

  constructor() {
    this.manager = new Manager(this);
    this.completer = new Completer(this);
    this.hover = new HoverProvider(this);
    this.definition = new DefinitionProvider(this);
    this.logPanel = host.createOutputChannel('PandocCiter');
    this.log(`PandocCiter is now activated`);
  }

  log(msg: string) {
    const cfg = host.getConfiguration('PandocCiter');
    if (cfg && cfg.get && cfg.get('ShowLog')) {
      // In VS Code this is append, in Zed adapter appendLine is supported
      if (this.logPanel.appendLine) this.logPanel.appendLine(msg);
      else if (this.logPanel.append) this.logPanel.append(msg + '\n');
    }
  }
}

export function deactivate() {}