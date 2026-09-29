import type * as Party from 'partykit/server';

export default class Server implements Party.Server {
  constructor(private readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`
    );

    conn.send('hello from server');
  }

  onMessage(message: string, sender: Party.Connection) {
    console.log(`connection ${sender.id} sent message: ${message}`);
    this.room.broadcast(
      `${sender.id}: ${message}`,
      [sender.id] // excluded from the broadcast
    );
  }
}

Server satisfies Party.Worker;
