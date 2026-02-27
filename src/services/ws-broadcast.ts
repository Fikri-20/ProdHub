import type { WebSocket } from "@fastify/websocket";

const clients = new Map<string, Set<WebSocket>>();

export function addClient(userId: string, ws: WebSocket): void {
  let userClients = clients.get(userId);
  if (!userClients) {
    userClients = new Set();
    clients.set(userId, userClients);
  }
  userClients.add(ws);

  ws.on("close", () => {
    userClients!.delete(ws);
    if (userClients!.size === 0) {
      clients.delete(userId);
    }
  });
}

export function broadcastToUser(userId: string, event: unknown): void {
  const userClients = clients.get(userId);
  if (!userClients) return;

  const message = JSON.stringify(event);
  for (const ws of userClients) {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  }
}
