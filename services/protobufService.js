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
  try {
    const type = root.lookupType(typeName);
    return type;
  } catch (e) {
    console.error('프로토버프 타입을 가져오는데 실패했습니다', e);
    throw new Error(e);
  }
};

/**
 * 주어진 Protobuf 메시지 타입과 데이터로 직렬화된 Buffer 생성
 * @param {protobuf.Type} MessageType - Protobuf 메시지 타입
 * @param {Object} payload - 메시지에 들어갈 데이터
 * @returns {Buffer} - 4바이트 길이 프레임 + 메시지 바디가 포함된 전체 Buffer
 */
export function encodeProtoMessage(messageTypeName, payload) {
  try {
    const Envelope = getMessageType('Envelope');
    
    const wrappedPayload = {
      [messageTypeName]: payload,
    };

    const verifyResult = Envelope.verify(wrappedPayload);
    if (verifyResult !== null) {
      throw new Error(`프로토 메시지 검증 실패: ${verifyResult}`);
    }

    const messageBuffer = Envelope.encode(wrappedPayload).finish();
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32BE(messageBuffer.length, 0);
    return Buffer.concat([lengthBuffer, messageBuffer]);
  } catch (e) {
    console.error('프로토 메세지를 인코딩하는 중 문제가 발생했습니다', e);
  }
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
