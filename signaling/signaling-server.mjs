import { WebSocketServer, WebSocket } from "ws";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATS_FILE = path.join(__dirname, "../public/stats.json");

const PORT = process.env.PORT || 9000;
const wss = new WebSocketServer({ port: PORT });

let stats = { totalBytes: 0 };
try {
  if (fs.existsSync(STATS_FILE)) {
    stats = JSON.parse(fs.readFileSync(STATS_FILE, "utf8"));
  }
} catch (err) {
  console.error("Failed to load stats:", err);
}

const saveStats = () => {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  } catch (err) {
    console.error("Failed to save stats:", err);
  }
};

console.log(`WebSocket Signaling & Relay Server running on port ${PORT}`);

const rooms = new Map();

wss.on("connection", (ws) => {
  let currentCode = null;
  let currentRole = null;

  ws.on("message", (message, isBinary) => {
    if (isBinary) {
      if (currentCode) {
        const room = rooms.get(currentCode);
        if (room) {
          const target = currentRole === "sender" ? room.receiver : room.sender;
          if (target && target.readyState === WebSocket.OPEN) {
            target.send(message, { binary: true });
            
            stats.totalBytes += message.length;
            if (stats.totalBytes % 1024 === 0) saveStats();
          }
        }
      }
      return;
    }

    try {
      const parsed = JSON.parse(message.toString());
      const { type, code, role, bytes } = parsed;

      if (type === "stats_update" && bytes) {
        stats.totalBytes += bytes;
        saveStats();
        return;
      }

      if (type === "join") {
        currentCode = code;
        currentRole = role;
        
        if (!rooms.has(code)) {
          rooms.set(code, { sender: null, receiver: null });
        }
        
        const room = rooms.get(code);

        if (role === "receiver" && !room.sender) {
          ws.send(JSON.stringify({ type: "error", message: "No sender found with this code." }));
          if (!room.receiver) rooms.delete(code);
          ws.close();
          return;
        }

        room[role] = ws;
        console.log(`[${code}] ${role} joined.`);
        if (room.sender && room.receiver) {
          console.log(`[${code}] Room complete. Ready for handshakes.`);
          room.sender.send(JSON.stringify({ type: "peer_connected" }));
          room.receiver.send(JSON.stringify({ type: "peer_connected" }));
        }
        return;
      }

      if (currentCode) {
        const room = rooms.get(currentCode);
        if (room) {
          const target = currentRole === "sender" ? room.receiver : room.sender;
          if (target && target.readyState === WebSocket.OPEN) {
            target.send(JSON.stringify(parsed));
          }
        }
      }

    } catch (err) {
      console.error("Failed to parse message", err);
    }
  });

  ws.on("close", () => {
    if (currentCode) {
      console.log(`[${currentCode}] ${currentRole} disconnected.`);
      const room = rooms.get(currentCode);
      if (room && room[currentRole] === ws) {
        room[currentRole] = null;
        
        const otherRole = currentRole === "sender" ? "receiver" : "sender";
        const otherPeer = room[otherRole];
        if (otherPeer && otherPeer.readyState === WebSocket.OPEN) {
           otherPeer.send(JSON.stringify({ type: "peer_disconnected" }));
        }

        if (!room.sender && !room.receiver) {
          rooms.delete(currentCode);
          console.log(`[${currentCode}] Room destroyed.`);
        }
      }
    }
  });
});

setInterval(saveStats, 60000);
