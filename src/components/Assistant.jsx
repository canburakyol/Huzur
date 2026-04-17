/**
 * Re-export proxy — the monolithic Assistant.jsx (766 lines) has been
 * shredded into Feature-Sliced Design under:
 *
 *   src/domains/assistant/
 *   ├── components/
 *   │   ├── AssistantShell.jsx    (~200 lines, orchestrator)
 *   │   ├── ChatMessageBubble.jsx (message + trust badges)
 *   │   ├── ChatInput.jsx         (FAQ bar + text input)
 *   │   ├── PremiumMomentCard.jsx (premium upgrade card)
 *   │   └── Assistant.css         (scoped styles)
 *   └── hooks/
 *       └── useAssistant.js       (all state + logic)
 *
 * This file exists solely to keep existing import paths working.
 * After all consumers are updated, this file can be deleted.
 */
export { default } from '../domains/assistant/components/AssistantShell';
