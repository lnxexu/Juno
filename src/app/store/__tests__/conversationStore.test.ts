import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api, type Conversation, type Message } from '../../services/api';
import {
  replaceOptimisticMessageWithServerMessage,
  sortConversationMessages,
  type ConversationMessage,
  useConversationStore,
} from '../conversationStore';

const seededConversation: Conversation = {
  id: 1,
  customerId: 'customer-1',
  customerName: 'Sarah Miller',
  lastMessage: 'Previous message',
  timestamp: '2026-04-19T08:00:00.000Z',
  source: 'facebook',
  unread: false,
  aiHandled: false,
};

describe('useConversationStore message delivery', () => {
  beforeEach(() => {
    useConversationStore.setState(useConversationStore.getInitialState(), true);
    useConversationStore.setState({
      conversations: [seededConversation],
      selectedConversationId: seededConversation.id,
      aiEnabled: false,
      messages: [],
      isSending: false,
      error: null,
    });
    vi.restoreAllMocks();
  });

  it('marks optimistic messages as failed and leaves no pending state when send fails', async () => {
    vi.spyOn(api.conversations, 'sendMessage').mockRejectedValueOnce(new Error('Network timeout'));

    const wasSent = await useConversationStore.getState().sendMessage(seededConversation.id, 'Hello there');

    expect(wasSent).toBe(false);

    const state = useConversationStore.getState();
    expect(state.isSending).toBe(false);
    expect(state.error).toBe('Failed to send message. Network timeout');
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].deliveryStatus).toBe('failed');
    expect(state.messages[0].originalText).toBe('Hello there');
    expect(state.messages.some((msg) => msg.deliveryStatus === 'pending')).toBe(false);
  });

  it('fails immediately when offline and does not call the send API', async () => {
    vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
    const sendSpy = vi.spyOn(api.conversations, 'sendMessage');

    const wasSent = await useConversationStore.getState().sendMessage(seededConversation.id, 'Hello there');

    expect(wasSent).toBe(false);
    expect(sendSpy).not.toHaveBeenCalled();

    const state = useConversationStore.getState();
    expect(state.isSending).toBe(false);
    expect(state.error).toBe('Failed to send message. You are offline. Please check your internet connection and try again.');
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].deliveryStatus).toBe('failed');
    expect(state.messages.some((msg) => msg.deliveryStatus === 'pending')).toBe(false);
  });

  it('prevents duplicate rapid submits while a message is in flight', async () => {
    const deliveredMessage: Message = {
      id: 102,
      conversationId: seededConversation.id,
      sender: 'agent',
      text: 'Hello there',
      timestamp: '2026-04-19T09:15:00.000Z',
    };

    let resolveSend!: (message: Message) => void;
    const sendSpy = vi.spyOn(api.conversations, 'sendMessage').mockReturnValueOnce(
      new Promise<Message>((resolve) => {
        resolveSend = resolve;
      })
    );

    const firstSendPromise = useConversationStore
      .getState()
      .sendMessage(seededConversation.id, 'Hello there');

    const secondSendResult = await useConversationStore
      .getState()
      .sendMessage(seededConversation.id, 'Hello there');

    expect(secondSendResult).toBe(false);
    expect(sendSpy).toHaveBeenCalledTimes(1);

    const pendingState = useConversationStore.getState();
    expect(pendingState.isSending).toBe(true);
    expect(pendingState.messages).toHaveLength(1);
    expect(pendingState.messages[0].deliveryStatus).toBe('pending');

    resolveSend(deliveredMessage);
    const firstSendResult = await firstSendPromise;

    expect(firstSendResult).toBe(true);

    const finalState = useConversationStore.getState();
    expect(finalState.isSending).toBe(false);
    expect(finalState.messages).toHaveLength(1);
    expect(finalState.messages[0].id).toBe(deliveredMessage.id);
    expect(finalState.messages[0].deliveryStatus).toBe('sent');
  });

  it('retries a failed message and replaces it with one sent message only', async () => {
    const deliveredMessage: Message = {
      id: 101,
      conversationId: seededConversation.id,
      sender: 'agent',
      text: 'Hello there',
      timestamp: '2026-04-19T09:00:00.000Z',
    };

    const sendSpy = vi
      .spyOn(api.conversations, 'sendMessage')
      .mockRejectedValueOnce(new Error('Temporary outage'))
      .mockResolvedValueOnce(deliveredMessage);

    await useConversationStore.getState().sendMessage(seededConversation.id, 'Hello there');

    const failedMessage = useConversationStore.getState().messages[0];
    expect(failedMessage.deliveryStatus).toBe('failed');

    const retried = await useConversationStore
      .getState()
      .retryMessage(seededConversation.id, failedMessage.id);

    expect(retried).toBe(true);
    expect(sendSpy).toHaveBeenNthCalledWith(1, seededConversation.id, 'Hello there', false);
    expect(sendSpy).toHaveBeenNthCalledWith(2, seededConversation.id, 'Hello there', false);

    const state = useConversationStore.getState();
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].id).toBe(deliveredMessage.id);
    expect(state.messages[0].text).toBe(deliveredMessage.text);
    expect(state.messages[0].deliveryStatus).toBe('sent');
    expect(state.messages.some((msg) => msg.deliveryStatus === 'failed')).toBe(false);
    expect(state.messages.some((msg) => msg.deliveryStatus === 'pending')).toBe(false);
  });

  it('keeps deterministic ordering and dedupes temp-to-server replacements when resolution is out of order', () => {
    const optimisticFirst: ConversationMessage = {
      id: -101,
      clientRequestId: 'temp-1',
      conversationId: seededConversation.id,
      sender: 'agent',
      text: 'First optimistic',
      timestamp: '2026-04-19T09:00:00.000Z',
      deliveryStatus: 'pending',
      originalText: 'First optimistic',
    };

    const optimisticSecond: ConversationMessage = {
      id: -102,
      clientRequestId: 'temp-2',
      conversationId: seededConversation.id,
      sender: 'agent',
      text: 'Second optimistic',
      timestamp: '2026-04-19T09:00:01.000Z',
      deliveryStatus: 'pending',
      originalText: 'Second optimistic',
    };

    const preExistingServerDuplicateForSecond: ConversationMessage = {
      id: 202,
      conversationId: seededConversation.id,
      sender: 'agent',
      text: 'Second from server',
      timestamp: '2026-04-19T09:00:02.000Z',
      deliveryStatus: 'sent',
    };

    const resolvedFirst: ConversationMessage = {
      id: 201,
      clientRequestId: 'temp-1',
      conversationId: seededConversation.id,
      sender: 'agent',
      text: 'First from server',
      timestamp: '2026-04-19T09:00:03.000Z',
      deliveryStatus: 'sent',
    };

    const resolvedSecond: ConversationMessage = {
      id: 202,
      clientRequestId: 'temp-2',
      conversationId: seededConversation.id,
      sender: 'agent',
      text: 'Second from server',
      timestamp: '2026-04-19T09:00:04.000Z',
      deliveryStatus: 'sent',
    };

    const initialMessages = sortConversationMessages([
      optimisticFirst,
      optimisticSecond,
      preExistingServerDuplicateForSecond,
    ]);

    const outOfOrderResolvedSecond = replaceOptimisticMessageWithServerMessage(
      initialMessages,
      optimisticSecond.id,
      resolvedSecond,
    );
    const outOfOrderFinal = replaceOptimisticMessageWithServerMessage(
      outOfOrderResolvedSecond,
      optimisticFirst.id,
      resolvedFirst,
    );

    const inOrderResolvedFirst = replaceOptimisticMessageWithServerMessage(
      initialMessages,
      optimisticFirst.id,
      resolvedFirst,
    );
    const inOrderFinal = replaceOptimisticMessageWithServerMessage(
      inOrderResolvedFirst,
      optimisticSecond.id,
      resolvedSecond,
    );

    expect(outOfOrderFinal).toEqual(inOrderFinal);
    expect(outOfOrderFinal).toHaveLength(2);
    expect(outOfOrderFinal.map((message) => message.id)).toEqual([201, 202]);
    expect(outOfOrderFinal.map((message) => message.clientRequestId)).toEqual(['temp-1', 'temp-2']);
  });
});
