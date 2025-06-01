import protobuf from 'protobufjs';

let root; // 캐시용

export const loadProto = async () => {
  if (!root) {
    root = await protobuf.load('./proto/common.proto');
  }
  return root;
};

export const getMessageType = typeName => {
  if (!root) throw new Error('proto not loaded yet!');
  return root.lookupType(typeName);
};

/**
 * 주어진 Protobuf 메시지 타입과 데이터로 직렬화된 Buffer 생성
 * @param {protobuf.Type} MessageType - Protobuf 메시지 타입
 * @param {Object} payload - 메시지에 들어갈 데이터
 * @returns {Buffer} - 4바이트 길이 프레임 + 메시지 바디가 포함된 전체 Buffer
 */
export function encodeProtoMessage(MessageType, payload) {
  const messageBuffer = MessageType.encode(payload).finish();
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(messageBuffer.length, 0);
  return Buffer.concat([lengthBuffer, messageBuffer]);
}

/**
 * 주어진 buffer에서 Protobuf 메시지를 역직렬화
 * @param {protobuf.Type} MessageType
 * @param {Buffer} buffer - (길이 프레임 없이) 순수 메시지 바디
 * @returns {Object}
 */
export function decodeProtoMessage(MessageType, buffer) {
  return MessageType.decode(buffer);
}
