import { jidDecode, type proto } from "@whiskeysockets/baileys";

type Sequence = { low: number; high: number; unsigned: boolean };

export const formatMessageOnReceive = (
  msg: proto.IWebMessageInfo,
  instance_id: string
) => {
  const messageType = Object.keys(msg.message || {})[0] || "unknown";
  const from = msg.key.remoteJid || "";
  const fromDecoded = jidDecode(from || "");
  const fromUser = fromDecoded?.user || "";
  const pushName = msg.pushName || "";

  const forwarded =
    (msg.message?.extendedTextMessage?.contextInfo?.isForwarded ?? false) ||
    (msg.message?.extendedTextMessage?.contextInfo?.forwardingScore ?? 0) > 0 ||
    (msg.message?.imageMessage?.contextInfo?.isForwarded ?? false) ||
    (msg.message?.imageMessage?.contextInfo?.forwardingScore ?? 0) > 0;

  const momment = msg.messageTimestamp
    ? Number(msg.messageTimestamp) * 1000
    : Date.now();

  const base = {
    instance_id,
    messageId: msg.key.id || "",
    phone: fromUser,
    fromMe: msg.key.fromMe || false,
    momment,
    senderName: pushName || "",
    forwarded,
  };

  switch (messageType) {
    case "conversation":
    case "extendedTextMessage":
      return {
        ...base,
        text: {
          message:
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            "",
        },
      };

    case "locationMessage": {
      const locMsg = msg.message?.locationMessage;
      return {
        ...base,
        location: {
          longitude: locMsg?.degreesLongitude || 0,
          latitude: locMsg?.degreesLatitude || 0,
          name: locMsg?.name || null,
          address: locMsg?.address || "",
          url: "",
        },
      };
    }

    case "liveLocationMessage": {
      const liveMsg = msg.message?.liveLocationMessage;
      return {
        ...base,
        liveLocation: {
          longitude: liveMsg?.degreesLongitude || 0,
          latitude: liveMsg?.degreesLatitude || 0,
          sequence: liveMsg?.sequenceNumber
            ? (liveMsg.sequenceNumber as unknown as Sequence)
            : { low: 0, high: 0, unsigned: false },
          caption: liveMsg?.caption || "",
        },
      };
    }
  }
};
