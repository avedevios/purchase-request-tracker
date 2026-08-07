export let activeChatItem = null;

export function setActiveChatItem(item) {
  activeChatItem = item;
}

export function scrollToChatBottom(chatThreadContainer) {
  setTimeout(() => {
    if (chatThreadContainer) {
      chatThreadContainer.scrollTop = chatThreadContainer.scrollHeight;
    }
  }, 50);
}

export function renderChatThread(chatThreadContainer, currentUser) {
  if (!chatThreadContainer) return;
  chatThreadContainer.innerHTML = '';

  if (!activeChatItem || !activeChatItem.comments || activeChatItem.comments.length === 0) {
    chatThreadContainer.innerHTML = `<div style="text-align: center; color: var(--text-dim); margin: auto; font-size: 0.85rem;">No messages in this response discussion yet.<br>Be the first to post a message below!</div>`;
    return;
  }

  activeChatItem.comments.forEach(msg => {
    const isOwn = msg.author === currentUser;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isOwn ? 'own' : 'other'}`;
    bubble.innerHTML = `
      <div class="chat-bubble-meta">
        <span class="chat-bubble-user">${msg.author}</span>
        <span>•</span>
        <span>${msg.time}</span>
      </div>
      <div class="chat-bubble-content">${msg.text}</div>
    `;
    chatThreadContainer.appendChild(bubble);
  });

  scrollToChatBottom(chatThreadContainer);
}

export function openChatModal(item, currentUser, chatIssueSubtitle, chatModal, chatThreadContainer, chatInput) {
  activeChatItem = item;
  if (chatIssueSubtitle) chatIssueSubtitle.textContent = item.issue || 'Issue response thread';
  
  if (!item.comments) item.comments = [];
  if (item.response && item.comments.length === 0) {
    item.comments.push({
      author: item.ball || "Adonis",
      time: "Earlier",
      text: item.response
    });
  }

  renderChatThread(chatThreadContainer, currentUser);
  if (chatModal) chatModal.style.display = 'flex';
  scrollToChatBottom(chatThreadContainer);
  if (chatInput) setTimeout(() => chatInput.focus(), 100);
}

export function postNewChatMessage(chatInput, currentUser, chatThreadContainer, renderCallback, saveChangesCallback) {
  if (!chatInput) return;
  const text = chatInput.value.trim();
  if (!text || !activeChatItem) return;

  const now = new Date();
  const timeStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!activeChatItem.comments) activeChatItem.comments = [];
  activeChatItem.comments.push({
    author: currentUser,
    time: timeStr,
    text: text
  });

  activeChatItem.response = text;
  chatInput.value = '';
  renderChatThread(chatThreadContainer, currentUser);
  if (renderCallback) renderCallback();
  scrollToChatBottom(chatThreadContainer);
  if (saveChangesCallback) saveChangesCallback(currentUser, activeChatItem);
}
