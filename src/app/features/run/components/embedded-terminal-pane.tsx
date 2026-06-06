import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import React from 'react';
import { getRunService } from '@org/services';

export interface EmbeddedTerminalPaneProps {
  sessionId: string;
  liveOutput: string;
  disabled?: boolean;
}

export const EmbeddedTerminalPane: React.FC<EmbeddedTerminalPaneProps> = ({
  sessionId,
  liveOutput,
  disabled = false,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const terminalRef = React.useRef<Terminal | null>(null);
  const fitRef = React.useRef<FitAddon | null>(null);
  const writtenLengthRef = React.useRef(0);
  const sessionRef = React.useRef(sessionId);

  React.useEffect(() => {
    sessionRef.current = sessionId;
    writtenLengthRef.current = 0;
  }, [sessionId]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const terminal = new Terminal({
      cursorBlink: true,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: 12,
      lineHeight: 1.35,
      theme: {
        background: '#0a0f14',
        foreground: '#d8e8f0',
        cursor: '#00ff88',
        selectionBackground: 'rgba(0, 255, 136, 0.25)',
      },
      disableStdin: disabled,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(container);
    fitAddon.fit();

    terminal.onData((data) => {
      if (disabled) return;
      void getRunService().writeSession(sessionRef.current, data);
    });

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      const dims = fitAddon.proposeDimensions();
      if (dims) {
        void getRunService().resizeSession(
          sessionRef.current,
          Math.max(dims.cols, 20),
          Math.max(dims.rows, 5),
        );
      }
    });
    resizeObserver.observe(container);

    terminalRef.current = terminal;
    fitRef.current = fitAddon;

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitRef.current = null;
    };
  }, [sessionId, disabled]);

  React.useEffect(() => {
    const terminal = terminalRef.current;
    if (!terminal) return;
    if (liveOutput.length <= writtenLengthRef.current) return;
    const chunk = liveOutput.slice(writtenLengthRef.current);
    terminal.write(chunk);
    writtenLengthRef.current = liveOutput.length;
  }, [liveOutput]);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[220px] w-full overflow-hidden rounded-xl border border-border/70 bg-[#0a0f14] p-2"
    />
  );
};
