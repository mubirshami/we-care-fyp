import React from 'react';

export default function ChatbotPage() {
  return (
    <div className="max-w-[680px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-display font-semibold text-neutral-900 mb-1">Chat</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Talk through what's on your mind. Your chatbot is here to listen and support you.
      </p>

      {/* Context card */}
      <div className="mb-6 rounded-card border border-primary-100 bg-primary-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5" aria-hidden="true">💡</span>
          <div>
            <p className="text-sm font-semibold text-primary-800">A safe space to talk</p>
            <p className="mt-1 text-sm text-primary-700">
              The chatbot is trained to offer supportive, empathetic responses. For urgent support,
              please reach out to a qualified mental health professional.
            </p>
          </div>
        </div>
      </div>

      {/* Chat embed */}
      <div className="rounded-card border border-neutral-200 bg-white shadow-card overflow-hidden">
        <div className="border-b border-neutral-100 px-5 py-3.5 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success-500" aria-hidden="true" />
          <p className="text-sm font-medium text-neutral-700">We Care Support Assistant</p>
        </div>
        <div className="flex justify-center items-start p-4">
          <iframe
            title="We Care Support Chatbot"
            allow="microphone;"
            src="https://console.dialogflow.com/api-client/demo/embedded/a1f2ab4e-1c9d-455f-b88d-139f5dc4b0cf"
            className="w-full rounded-md border-0"
            style={{ height: '460px', maxWidth: '480px' }}
          />
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-center text-xs text-neutral-400">
        This chatbot is an AI assistant and is not a substitute for professional mental health care.
      </p>
    </div>
  );
}
