import SpaceBattleServer from './main';

import type * as Party from 'partykit/server';

const connect = (server: SpaceBattleServer, id: string): unknown[] => {
  const received: unknown[] = [];
  const conn = { id, send: (message: string) => received.push(JSON.parse(message)) } as unknown as Party.Connection;
  server.onConnect(conn);
  return Object.assign(received, { conn });
};

const setup = (): { server: SpaceBattleServer; received: unknown[]; conn: Party.Connection } => {
  const room = { storage: { setAlarm: vi.fn(async () => undefined) } } as unknown as Party.Room;
  const server = new SpaceBattleServer(room);
  const received = connect(server, 'pilot') as unknown[] & { conn: Party.Connection };
  return { server, received, conn: received.conn };
};

interface State {
  readonly ships: ReadonlyArray<{ readonly defId: string; readonly vx: number }>;
}

const lastState = (received: unknown[]): State =>
  received.filter((message) => (message as { type: string }).type === 'gameState').at(-1) as State;

describe('SpaceBattleServer', () => {
  it('spawns the ship a pilot picks', async () => {
    const { server, received, conn } = setup();

    server.onMessage(JSON.stringify({ type: 'selectShip', shipId: 'tank' }), conn);
    await server.onAlarm();

    expect(lastState(received).ships.map(({ defId }) => defId)).toEqual(['tank']);
  });

  it('ignores a ship kind it does not know, an inherited name included', async () => {
    const { server, received, conn } = setup();

    server.onMessage(JSON.stringify({ type: 'selectShip', shipId: 'toString' }), conn);
    server.onMessage(JSON.stringify({ type: 'selectShip', shipId: 'battleship' }), conn);
    await server.onAlarm();

    expect(received.map((message) => (message as { type: string }).type)).toEqual(['lobby']);
  });

  it('ignores what is not a JSON message', () => {
    const { server, conn } = setup();

    expect(() => server.onMessage('{ not json', conn)).not.toThrow();
    expect(() => server.onMessage('null', conn)).not.toThrow();
    expect(() => server.onMessage(new ArrayBuffer(4), conn)).not.toThrow();
  });

  it('thrusts only on a `true` flag, not on a truthy string', async () => {
    const { server, received, conn } = setup();
    server.onMessage(JSON.stringify({ type: 'selectShip', shipId: 'scout' }), conn);

    server.onMessage(JSON.stringify({ type: 'input', thrust: 'yes' }), conn);
    await server.onAlarm();
    const [coasting] = lastState(received).ships;
    server.onMessage(JSON.stringify({ type: 'input', thrust: true }), conn);
    await server.onAlarm();
    const [thrusting] = lastState(received).ships;

    expect(coasting.vx).toBe(0);
    expect(thrusting.vx).not.toBe(0);
  });
});
