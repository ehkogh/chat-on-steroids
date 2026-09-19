/**
 * The Codex app shell that ChatGPT A/B-tests as its web UI since 2026-09-18.
 *
 * Every fixture here is transcribed from the live shell page (2026-09-19): the composer form
 * and its id-less editor, the `[data-turn-key]` exchange with its three blocks, the typed
 * `entry.turn.items` React model, the query-cache conversation payload and the picker owner
 * with its power selections. The classic page keeps its own fixtures in extension.test.ts,
 * chatgpt-dom-input.test.ts and fiber.test.ts; this file is the other renderer.
 */

import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';

const domSource = readFileSync(new URL('../extension/chatgpt-dom.js', import.meta.url), 'utf8');
const fiberSource = readFileSync(new URL('../extension/fiber.js', import.meta.url), 'utf8');

const THREAD = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const USER = 'u1u1u1u1-1111-4111-8111-111111111111';
const TURN = 't1t1t1t1-2222-4222-8222-222222222222';
const CALL = 'c1c1c1c1-3333-4333-8333-333333333333';
const ANSWER = 'a1a1a1a1-4444-4444-8444-444444444444';
const FIBER_KEY = '__reactFiber$shellfixture';

interface Fiber { memoizedProps: Record<string, unknown> | null; return: Fiber | null }

/** A Fiber chain ending in `props`, with `filler` anonymous layout nodes below it. */
function chain(props: Record<string, unknown>, filler = 3, above: Fiber | null = null): Fiber {
  let node: Fiber = { memoizedProps: props, return: above };
  for (let up = 0; up < filler; up++) node = { memoizedProps: { className: 'flex', children: null }, return: node };
  return node;
}

interface ShellOptions {
  generating?: boolean;
  pendingOnly?: boolean;
  workMode?: boolean;
  worked?: string;
  answer?: string;
  userText?: string;
  withAnswerSlot?: boolean;
}

function shellHtml(options: ShellOptions = {}): string {
  const worked = options.worked ?? 'Worked for 12s';
  const answer = options.answer ?? 'The answer';
  const userText = options.userText ?? 'hello there';
  const composer = options.pendingOnly
    ? '<form><textarea id="pending-home-input" aria-label="Ask ChatGPT"></textarea></form>'
    : `<form data-chatgpt-composer="" data-composer-placement="thread" class="relative flex flex-col gap-2">
        <input type="file" accept="image/*,video/*" class="hidden" aria-label="Attach photos or videos">
        <input type="file" accept="image/*" class="hidden" aria-label="Attach photos">
        <input type="file" class="hidden" aria-label="Attach files">
        <div data-composer-body="">
          <div data-composer-input-layout="single-line" role="presentation">
            <div contenteditable="true" role="textbox" class="ProseMirror" data-composer-markdown="" aria-label="Ask ChatGPT"><p data-empty-paragraph="true"><br></p></div>
          </div>
          <div class="flex items-center">
            <button type="button" aria-label="Add files and more" data-composer-navigation-target="add-context"></button>
            <button type="button" aria-label="Select ChatGPT model" aria-haspopup="menu" aria-expanded="false" data-codex-intelligence-trigger="true" data-composer-navigation-target="reasoning" data-selected-reasoning-effort="medium"><span>Medium</span></button>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <div class="flex items-center"><button type="button" aria-label="Dictate"></button></div>
            <div class="flex items-center">${options.generating
              ? '<button type="button" aria-label="Stop"></button>'
              : '<button type="submit" aria-label="Send"></button>'}</div>
          </div>
        </div>
      </form>`;
  return `<!doctype html><html><body><div id="root">
    <div id="app-shell-sidebar"><nav aria-label="Show sidebar">
      <button type="button" class="sidebar-item" aria-label="New chat"><span class="sr-only">New chat</span></button>
      <div role="listitem" data-sidebar-chatgpt-conversation-key="chatgpt:conversation:${THREAD}"><div role="button" aria-label="Casual Greeting Reply"></div></div>
    </nav></div>
    <header data-app-shell-titlebar="true"><div role="group" aria-label="Composer mode">
      <button type="button" aria-pressed="${options.workMode ? 'false' : 'true'}">Chat</button>
      <button type="button" aria-pressed="${options.workMode ? 'true' : 'false'}"><span>Work</span></button>
    </div></header>
    <div data-app-shell-main-surface="true">
      <div data-thread-find-target="conversation">
        <div data-turn-key="${USER}"><div data-content-search-turn-key="${TURN}"><div class="flex flex-col gap-3">
          <div class="block-a1b2c3"><h4 class="sr-only">You said:</h4>
            <div data-content-search-unit-key="${TURN}:0:user"><div data-user-message-bubble="true"><div class="text-size-chat whitespace-pre-wrap" dir="auto">${userText}</div></div></div>
          </div>
          <div class="block-a1b2c3"><span hidden data-chatgpt-agent-turn-start=""></span>
            <div class="min-w-0"><div class="flex min-w-0 flex-col">
              <button type="button" class="group/activity-header" aria-expanded="true"><span>${worked}</span></button>
              <div class="-ms-2 ps-2"><div class="flex flex-col gap-2">
                <div data-markdown-text-style="assistant-message" data-markdown-text-tone="primary"><p>Looking at files</p></div>
                <div class="group/activity-header"><span><div data-markdown-text-style="assistant-message" data-markdown-text-tone="tertiary"><p>Inspected the repo</p></div></span></div>
              </div></div>
            </div></div>
          </div>
          ${options.withAnswerSlot === false ? '' : `<div class="block-a1b2c3"><div data-content-search-unit-key="${TURN}:2:assistant"><div class="group flex min-w-0 flex-col">
            <div data-markdown-text-style="assistant-message" class="MarkdownRoot-x"><p class="Paragraph-x"><span>${answer}</span></p></div>
          </div></div></div>`}
        </div></div></div>
      </div>
      ${composer}
    </div>
  </div></body></html>`;
}

interface DomApi {
  shell(): boolean;
  TURN_SELECTOR: string;
  AUTHORED_SELECTOR: string;
  turnIdOf(node: Element | null): string | null;
  messageIdOf(node: Element | null): string | null;
  composer(): HTMLElement | null;
  composerVisible(): boolean;
  composerSubmitReady(): boolean;
  composerActions(): { host: HTMLElement; before: HTMLElement | null } | null;
  generating(): boolean;
  stopButton(): HTMLButtonElement | null;
  sendButton(): HTMLButtonElement | null;
  conversationId(): string | null;
  conversationFromPath(pathname: string): string | null;
  turns(): Array<{ node: HTMLElement; nodes: HTMLElement[]; id: string | null; role: string | null }>;
  messages(): Array<{ id: string; role: string; text: string; turnId: string | null; node: HTMLElement }>;
  messagesIn(turn: unknown): Array<{ id: string; role: string; text: string }>;
  sectionSignature(node: HTMLElement): string;
  progressLine(turn: unknown): string | null;
  progressItems(turn: unknown, key: string): Array<{ id: string; text: string }>;
  activityItems(turn: unknown): Array<{ kind: string; text?: string }>;
  markProgress(turn: unknown): number;
  toolBlocks(turn: unknown): HTMLElement[];
  connectorRows(root?: Element): HTMLElement[];
  firstUserMessage(): HTMLElement | null;
  replaceActivity(turn: unknown, root: HTMLElement, replaced: boolean): boolean;
  prepareChatModelSurface(current?: () => boolean): Promise<boolean>;
  newChatControl(current?: () => boolean): Promise<HTMLElement | null>;
  presentUserPrompts(read?: unknown): void;
  insertPrompt(text: string, mode?: boolean | 'append'): boolean;
  errors(): Array<{ text: string }>;
}

let dom: JSDOM | null = null;

function loadShell(options: ShellOptions = {}, pathname = `/c/${THREAD}`): { api: DomApi; document: Document; window: Window & typeof globalThis } {
  dom = new JSDOM(shellHtml(options), { url: `https://chatgpt.com${pathname}`, runScripts: 'outside-only', pretendToBeVisual: true });
  const window = dom.window as unknown as Window & typeof globalThis;
  Object.defineProperty(window.HTMLElement.prototype, 'getClientRects', { value() { return this.hidden ? [] : [{ width: 10, height: 10 }]; } });
  window.eval(domSource);
  return { api: (window as unknown as { CLF_DOM: DomApi }).CLF_DOM, document: window.document, window };
}

afterEach(() => { dom?.window.close(); dom = null; });

describe('Codex shell: renderer identity and composer', () => {
  it('recognises the shell and finds its id-less editor, never the pre-hydration textarea', () => {
    const { api, document } = loadShell();
    expect(api.shell()).toBe(true);
    expect(api.composer()).toBe(document.querySelector('.ProseMirror'));
    expect(api.composerVisible()).toBe(true);
    expect(api.composerSubmitReady()).toBe(true);
    const pending = loadShell({ pendingOnly: true });
    expect(pending.api.shell()).toBe(true);
    expect(pending.api.composer()).toBeNull();
  });

  it('reads Send and the plain "Stop" control from the composer form only', () => {
    const idle = loadShell();
    expect(idle.api.sendButton()?.getAttribute('aria-label')).toBe('Send');
    expect(idle.api.generating()).toBe(false);
    expect(idle.api.stopButton()).toBeNull();
    const busy = loadShell({ generating: true });
    expect(busy.api.generating()).toBe(true);
    expect(busy.api.stopButton()?.getAttribute('aria-label')).toBe('Stop');
    expect(busy.api.sendButton()).toBeNull();
    expect(busy.api.composerSubmitReady()).toBe(false);
  });

  it('anchors our composer control in the trailing row before the submit slot', () => {
    const { api, document } = loadShell();
    const actions = api.composerActions()!;
    expect(actions.host).toBe(document.querySelector('.flex.shrink-0.items-center.gap-2'));
    expect(actions.before).toBe(document.querySelector('button[type="submit"]')!.parentElement);
  });

  it('enters Chat mode through the pressed-button "Composer mode" group', async () => {
    const chat = loadShell();
    await expect(chat.api.prepareChatModelSurface()).resolves.toBe(true);
    const work = loadShell({ workMode: true });
    const [chatButton, workButton] = [...work.document.querySelectorAll('[role="group"] button')] as HTMLButtonElement[];
    chatButton!.addEventListener('click', () => { chatButton!.setAttribute('aria-pressed', 'true'); workButton!.setAttribute('aria-pressed', 'false'); });
    await expect(work.api.prepareChatModelSurface()).resolves.toBe(true);
  });

  it('finds the sidebar New chat button by its accessible name', async () => {
    const { api, document } = loadShell();
    await expect(api.newChatControl()).resolves.toBe(document.querySelector('button.sidebar-item'));
  });

  it('refuses the shell’s local pre-server route as a conversation id', () => {
    const { api } = loadShell({}, '/c/local-chatgpt%3A12345678-1234-4123-8123-123456789abc');
    expect(api.conversationId()).toBeNull();
    expect(api.conversationFromPath(`/c/${THREAD}`)).toBe(THREAD);
  });
});

describe('Codex shell: turns, messages and activity', () => {
  it('splits one exchange into a user turn and an assistant turn sharing the page turn id', () => {
    const { api, document } = loadShell();
    const turns = api.turns();
    expect(turns.map(turn => turn.role)).toEqual(['user', 'assistant']);
    expect(turns.map(turn => turn.id)).toEqual([TURN, TURN]);
    expect(turns[0]!.node).toBe(document.querySelector(`[data-content-search-unit-key="${TURN}:0:user"]`));
    expect(turns[1]!.node).toBe(document.querySelector('[data-turn-key]'));
    expect(api.turnIdOf(turns[1]!.node)).toBe(TURN);
    expect(api.TURN_SELECTOR).toContain('[data-turn-key]');
  });

  it('reads the prompt and the answer slot, never the commentary, under slot identities', () => {
    const { api } = loadShell();
    const messages = api.messages().map(({ id, role, text }) => ({ id, role, text }));
    expect(messages).toEqual([
      { id: `${TURN}:0:user`, role: 'user', text: 'hello there' },
      { id: `${TURN}:2:assistant`, role: 'assistant', text: 'The answer' }
    ]);
    const [, assistant] = api.turns();
    expect(api.messagesIn(assistant).map(message => message.role)).toEqual(['assistant']);
    expect(api.messageIdOf(api.firstUserMessage())).toBe(`${TURN}:0:user`);
  });

  it('forgets a slot’s memo when the page renames its placeholder key', () => {
    const { api, document } = loadShell();
    const slot = document.querySelector(`[data-content-search-unit-key="${TURN}:0:user"]`)!;
    expect(api.messages()[0]!.id).toBe(`${TURN}:0:user`);
    slot.setAttribute('data-content-search-unit-key', 'real-turn:0:user');
    expect(api.messages()[0]!.id).toBe('real-turn:0:user');
  });

  it('reports a response that has not produced its answer yet as an assistant turn', () => {
    const { api } = loadShell({ withAnswerSlot: false });
    expect(api.turns().map(turn => turn.role)).toEqual(['user', 'assistant']);
    expect(api.messages().map(message => message.role)).toEqual(['user']);
  });

  it('reads commentary and captions from the activity block without the stopwatch header', () => {
    const { api } = loadShell();
    const [, assistant] = api.turns();
    expect(api.progressLine(assistant)).toBe('Looking at files\nInspected the repo');
    expect(api.progressItems(assistant, 'g1').map(item => item.text)).toEqual(['Looking at files\nInspected the repo']);
    // jsdom has no innerText; the live page collapses this whitespace itself.
    expect(api.activityItems(assistant).map(item => ({ ...item, text: item.text?.replace(/\s+/g, ' ') })))
      .toEqual([{ kind: 'progress', text: 'Looking at files Inspected the repo' }]);
    expect(api.toolBlocks(assistant)).toEqual([]);
    expect(api.connectorRows()).toEqual([]);
    expect(api.markProgress(assistant)).toBe(1);
  });

  it('does not read a ticking "Worked for" header as page activity', () => {
    const before = loadShell({ worked: 'Worked for 12s' });
    const signatureBefore = before.api.sectionSignature(before.api.turns()[1]!.node);
    const after = loadShell({ worked: 'Worked for 13s' });
    expect(after.api.sectionSignature(after.api.turns()[1]!.node)).toBe(signatureBefore);
  });

  it('mounts our stream right after the page’s own turn-start marker', () => {
    const { api, document } = loadShell();
    const [, assistant] = api.turns();
    const root = document.createElement('div');
    root.className = 'clf-stream';
    expect(api.replaceActivity(assistant, root, true)).toBe(true);
    expect(root.previousElementSibling).toBe(document.querySelector('[data-chatgpt-agent-turn-start]'));
    expect(api.messages().map(message => message.text)).toEqual(['hello there', 'The answer']);
  });

  it('presents a framed prompt from the user slot', () => {
    const { api, document } = loadShell({ userText: '[[COS_CONTEXT:5]]\nhello\n[[/COS_CONTEXT]]\n\nvisible ask' });
    api.presentUserPrompts();
    expect(document.querySelector('[data-clf-user-text]')?.textContent).toBe('visible ask');
    expect(document.querySelector('[data-clf-prompt-hidden]')).not.toBeNull();
  });

  it('hands the reader the slot id and the page turn id, so the exact page-model text can be joined by turn', () => {
    // The shell renders inline code in the bubble, so the displayed text is not the frame.
    const { api, document } = loadShell({ userText: '[[COS_CONTEXT:5]]\nrg it\n[[/COS_CONTEXT]]\n\nvisible ask' });
    const seen: Array<{ id: string; turnId: string | null }> = [];
    api.presentUserPrompts((message: { id: string; turnId: string | null; node: HTMLElement }) => {
      seen.push({ id: message.id, turnId: message.turnId });
      return message.node === document.querySelector('[data-turn-key]') ? '[[COS_CONTEXT:7]]\n`rg` it\n[[/COS_CONTEXT]]\n\nvisible ask' : null;
    });
    expect(seen).toEqual([{ id: `${TURN}:0:user`, turnId: TURN }]);
    expect(document.querySelector('[data-clf-user-text]')?.textContent).toBe('visible ask');
  });

  it('inserts a prompt through the editor’s literal-paste mark so it is submitted unescaped', () => {
    const { api, document } = loadShell();
    document.execCommand = (command, _ui, value) => {
      const box = api.composer()!;
      if (command !== 'insertHTML' || document.activeElement !== box) return false;
      box.innerHTML = value || '';
      return true;
    };
    expect(api.insertPrompt('# Heading\n- item `code`', true)).toBe(true);
    const literal = api.composer()!.querySelector('span[data-prompt-literal-paste]')!;
    expect(literal).not.toBeNull();
    expect(literal.innerHTML).toBe('# Heading<br>- item `code`');
    expect(api.composer()!.textContent).toBe('# Heading- item `code`');
  });
});

// ------------------------------------------------------------------ Fiber

interface ShellItem { type: string; [key: string]: unknown }

interface FiberOptions {
  status?: 'in_progress' | 'complete' | 'cancelled';
  items?: ShellItem[];
  messageIds?: string[];
  mapping?: Record<string, { id: string; message?: Record<string, unknown>; children: string[] }> | null;
  answerCompleted?: boolean;
  /** The identity the thread carries; a chat started in this document keeps a local one. */
  entryConversationId?: string;
  /** Extra query-cache entries, as `[queryKey, data]`. */
  queries?: Array<[unknown[], unknown]>;
}

function liveItems(answerCompleted = false): ShellItem[] {
  return [
    { type: 'user-message', message: 'hello there', messageId: USER, serverMessageId: USER },
    { type: 'chatgpt-reasoning-group', completed: answerCompleted, items: [
      { type: 'reasoning', presentation: 'preamble', content: 'Looking at files', completed: true },
      { type: 'mcp-tool-call', callId: CALL, completed: false, durationMs: null, functionName: 'Chat On Steroids Core__link_x/read',
        invocation: { server: 'Chat On Steroids Core', tool: 'link_x/read', arguments: { paths: ['/secret'] } }, result: null, toolIcons: ['api_tool'] },
      { type: 'reasoning', presentation: 'thought', content: 'Inspected the repo', completed: true }
    ], reasoningRecap: { content: 'Worked for 12s', type: 'collapse' } },
    { type: 'assistant-message', messageId: ANSWER, content: 'The answer', completed: answerCompleted, phase: 'final_answer' }
  ];
}

async function scanShell(options: FiberOptions = {}): Promise<{ turns: any[]; rows: any[]; document: Document; picker: any }> {
  const { api, document, window } = loadShell({ answer: 'The answer' });
  void api;
  const entry = {
    id: TURN, conversationId: options.entryConversationId ?? THREAD, isMostRecentTurn: true, errorMessage: null,
    turn: { status: options.status ?? 'in_progress', items: options.items ?? liveItems(options.answerCompleted), messageIds: options.messageIds ?? [USER, CALL, ANSWER] }
  };
  const queries = [
    ...(options.mapping ? [{ queryKey: ['chatgpt-conversation', THREAD], state: { data: { mapping: options.mapping } } }] : []),
    ...(options.queries ?? []).map(([queryKey, data]) => ({ queryKey, state: { data } }))
  ];
  const client = queries.length ? { getQueryCache: () => ({ getAll: () => queries }) } : null;
  const top: Fiber = { memoizedProps: client ? { client, children: null } : { children: null }, return: null };
  const conversation: Fiber = { memoizedProps: { conversationId: options.entryConversationId ?? THREAD, entries: [entry] }, return: top };
  const row = chain({ entry, RowComponent: null }, 2, conversation);
  const container = document.querySelector('[data-turn-key]')!;
  (container as unknown as Record<string, unknown>)[FIBER_KEY] = row;
  const prose = document.querySelector(`[data-content-search-unit-key="${TURN}:2:assistant"] [data-markdown-text-style]`)!;
  (prose as unknown as Record<string, unknown>)[FIBER_KEY] = chain({ item: { type: 'assistant-message', messageId: ANSWER }, conversationId: THREAD, turnId: TURN }, 4, row);
  const trigger = document.querySelector('[data-codex-intelligence-trigger]')!;
  (trigger as unknown as Record<string, unknown>)[FIBER_KEY] = chain({
    powerSelections: [
      { id: 'gpt-5-6:', model: 'gpt-5-6', modelLabel: '5.6', reasoningEffort: 'none', powerSettingIndex: 0, sliderLabel: 'Instant' },
      { id: 'gpt-5-6-thinking:standard', model: 'gpt-5-6-thinking', modelLabel: '5.6', reasoningEffort: 'medium', powerSettingIndex: 1, sliderLabel: 'Medium' },
      { id: 'gpt-5-6-thinking:extended', model: 'gpt-5-6-thinking', modelLabel: '5.6', reasoningEffort: 'high', powerSettingIndex: 2, sliderLabel: 'High' }
    ],
    selectedLabelCandidate: { id: 'gpt-5-6-thinking:', model: 'gpt-5-6-thinking', modelLabel: '5.6', reasoningEffort: 'medium' },
    modelListConfig: { options: [{ id: '5.6', label: 'GPT-5.6 Sol', selected: true, disabled: false }, { id: '5.5', label: 'GPT-5.5', selected: false, disabled: false }] },
    menuView: 'simple', isExplicitModelSelection: false
  }, 6, top);
  window.eval(fiberSource);
  const ask = (source: string, replySource: string) => new Promise<any>((resolve, reject) => {
    const nonce = `n-${source}`;
    const timer = globalThis.setTimeout(() => reject(new Error(`no ${replySource}`)), 2000);
    window.addEventListener('message', (event: any) => {
      if (!event.data || event.data.source !== replySource || event.data.nonce !== nonce) return;
      globalThis.clearTimeout(timer);
      resolve(event.data);
    });
    window.dispatchEvent(new window.MessageEvent('message', { data: { source, nonce }, source: window }));
  });
  const reply = await ask('clf-fiber-ask', 'clf-fiber-reply');
  const picker = await ask('clf-picker-ask', 'clf-picker-reply');
  return { turns: reply.turns, rows: reply.rows, document, picker: picker.picker };
}

describe('Codex shell: turn evidence from the typed page model', () => {
  it('translates a running turn: the call unanswered, the answer open, commentary and caption in order', async () => {
    const { turns, rows, document } = await scanShell();
    expect(rows).toEqual([]);
    expect(turns).toHaveLength(1);
    const turn = turns[0];
    expect(turn.turnId).toBe(TURN);
    expect(turn.conversationId).toBe(THREAD);
    expect(turn.conversationConflict).toBe(false);
    expect(turn.endMessageId).toBeNull();
    expect(turn.calls).toEqual([{ messageId: CALL, tool: 'read', order: 0, answered: false, requestId: null, createTime: null }]);
    expect(turn.requests).toEqual([]);
    expect(turn.messages.map((m: any) => [m.role, m.rawMessageId, m.stable, m.rawText])).toEqual([
      ['user', USER, true, 'hello there'],
      ['assistant', `${TURN}:commentary:0`, false, 'Looking at files'],
      ['assistant', ANSWER, false, 'The answer']
    ]);
    expect(turn.messages[2].renderedHtml).toContain('The answer');
    expect(turn.activities).toEqual([{ messageId: `${TURN}:thought:2`, label: 'Inspected the repo', order: 3 }]);
    expect(turn.thoughtNotifications).toEqual([{ messageId: `${TURN}:thought:2`, kind: 'thought_notification' }]);
    expect(document.querySelector('[data-turn-key]')!.getAttribute('data-clf-fiber-turn')).toMatch(/:0$/);
    expect(document.querySelector(`[data-content-search-unit-key="${TURN}:2:assistant"] [data-markdown-text-style]`)!.getAttribute('data-clf-fiber-message')).toContain(encodeURIComponent(ANSWER));
  });

  it('never copies tool arguments across worlds', async () => {
    const { turns } = await scanShell();
    expect(JSON.stringify(turns)).not.toContain('/secret');
  });

  it('closes the turn on the completed answer and settles every call the page no longer runs', async () => {
    const { turns } = await scanShell({ status: 'complete', answerCompleted: true });
    expect(turns[0].endMessageId).toBe(ANSWER);
    expect(turns[0].calls.map((call: any) => call.answered)).toEqual([true]);
  });

  it('prefers the backend payload in the query cache: exact request ids, results and stable identities', async () => {
    const REQUEST = 'wfr_00000000000000000000000000000001';
    const message = (id: string, extra: Record<string, unknown>) => ({ id, create_time: 1789775394 + Number(id[0] === 'a'), metadata: {}, ...extra });
    const mapping = {
      [USER]: { id: USER, children: [CALL], message: message(USER, { author: { role: 'user' }, content: { content_type: 'text', parts: ['hello there'] } }) },
      [CALL]: { id: CALL, children: ['r1r1r1r1-5555-4555-8555-555555555555'], message: message(CALL, { author: { role: 'assistant' }, recipient: 'api_tool.call_tool',
        content: { content_type: 'code', text: '{"path":"/Chat On Steroids Core/link_x/read","args":{"paths":["/secret"]}}' }, metadata: { request_id: REQUEST, parent_id: USER } }) },
      'r1r1r1r1-5555-4555-8555-555555555555': { id: 'r1r1r1r1-5555-4555-8555-555555555555', children: [ANSWER], message: message('r1r1r1r1-5555-4555-8555-555555555555', {
        author: { role: 'tool', name: 'api_tool.call_tool' }, recipient: 'all', content: { content_type: 'code', text: '{}' },
        metadata: { request_id: REQUEST, parent_id: CALL, invoked_resource: { app_name: 'Chat On Steroids Core', resource_uri: '/asdk/link_x/read' } } }) },
      [ANSWER]: { id: ANSWER, children: [], message: message(ANSWER, { author: { role: 'assistant' }, channel: 'final', end_turn: true, status: 'finished_successfully',
        content: { content_type: 'text', parts: ['The answer'] },
        metadata: { parent_id: 'r1r1r1r1-5555-4555-8555-555555555555', request_id: REQUEST, working_turn_id: TURN, turn_exchange_id: TURN } }) }
    };
    const { turns } = await scanShell({ status: 'complete', answerCompleted: true, mapping });
    const turn = turns[0];
    expect(turn.calls).toEqual([{ messageId: CALL, tool: 'read', order: 0, answered: true, requestId: REQUEST, createTime: 1789775394 }]);
    expect(turn.requests.map((r: any) => r.requestId)).toEqual([REQUEST]);
    expect(turn.endMessageId).toBe(ANSWER);
    expect(turn.messages.map((m: any) => [m.role, m.rawMessageId, m.stable])).toEqual([['user', USER, true], ['assistant', ANSWER, true]]);
    expect(JSON.stringify(turns)).not.toContain('/secret');
  });

  it('falls back to the typed items when the payload does not cover every id the page shows', async () => {
    const mapping = { [USER]: { id: USER, children: [], message: { id: USER, author: { role: 'user' }, content: { content_type: 'text', parts: ['old branch'] }, metadata: {} } } };
    const { turns } = await scanShell({ mapping });
    expect(turns[0].messages[0].rawText).toBe('hello there');
    expect(turns[0].calls[0].requestId).toBeNull();
  });

  it('resolves a chat started in this document through the shell’s own local-to-server record', async () => {
    const local = 'local-chatgpt:12345678-1234-4123-8123-123456789abc';
    const unresolved = await scanShell({ entryConversationId: local });
    expect(unresolved.turns[0].conversationId).toBeNull();
    const resolved = await scanShell({ entryConversationId: local, queries: [[['chatgpt-conversation-details', { accountId: 'acc', clientConversationId: local, serverConversationId: THREAD }], {}]] });
    expect(resolved.turns[0].conversationId).toBe(THREAD);
    expect(resolved.turns[0].conversationConflict).toBe(false);
    const contradicted = await scanShell({ entryConversationId: local, queries: [
      [['chatgpt-conversation-details', { clientConversationId: local, serverConversationId: THREAD }], {}],
      [['chatgpt-file-upload-metadata', { conversationId: local, serverConversationId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' }], {}]
    ] });
    expect(contradicted.turns[0].conversationId).toBeNull();
  });

  it('reads the picker owner’s power selections as the classic snapshot, closed and unselected', async () => {
    const { picker, document } = await scanShell();
    expect(picker).toEqual({
      version: '5.6',
      currentBucket: 1,
      versions: [{ id: '5.6', label: 'GPT-5.6 Sol' }, { id: '5.5', label: 'GPT-5.5' }],
      choices: [
        { bucket: 0, id: 'gpt-5-6', label: 'GPT-5.6', effort: 'none', familyId: '5.6', familyLabel: 'GPT-5.6 Sol', available: true },
        { bucket: 1, id: 'gpt-5-6-thinking', label: 'GPT-5.6', effort: 'medium', familyId: '5.6', familyLabel: 'GPT-5.6 Sol', available: true },
        { bucket: 2, id: 'gpt-5-6-thinking', label: 'GPT-5.6', effort: 'high', familyId: '5.6', familyLabel: 'GPT-5.6 Sol', available: true }
      ]
    });
    const trigger = document.querySelector('[data-codex-intelligence-trigger]')!;
    expect(trigger.getAttribute('data-clf-selected-model')).toBe('gpt-5-6-thinking');
    expect(trigger.getAttribute('data-clf-selected-effort')).toBe('medium');
    expect(trigger.getAttribute('data-clf-selected-route')).toBe(`/c/${THREAD}`);
  });
});
