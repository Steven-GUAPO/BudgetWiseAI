import React from "react";

interface AIWidgetProps {
  width: string | number;
}

const AIWidget = ({ width }: AIWidgetProps): React.ReactElement => {
  return (
    <div
      style={{ width }}
      className="ai-chat-widget flex flex-col shadow-lg p-4 rounded-md bg-white"
    >
      {/* Widget Title */}
      <h2 className="widget-title relative text-lg font-serifDisplay mb-3">
        AI Widget
        <span className="absolute left-0 -bottom-0 w-16 h-[0.15px] bg-black"></span>
      </h2>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 space-y-3 mb-3">
        {/* Assistant Message */}
        <div className="flex justify-start">
          <div className="bg-gray-100 text-sm px-4 py-2 rounded-2xl rounded-bl-sm max-w-[75%]">
            Hi Willyam 👋 I can help analyze your spending or set a goal.
          </div>
        </div>

        {/* User Message */}
        <div className="flex justify-end">
          <div className="bg-emerald-500 text-white text-sm px-4 py-2 rounded-2xl rounded-br-sm max-w-[75%]">
            I spent $15 on coffee today.
          </div>
        </div>

        {/* Assistant Message */}
        <div className="flex justify-start">
          <div className="bg-gray-100 text-sm px-4 py-2 rounded-2xl rounded-bl-sm max-w-[75%]">
            Got it! ☕ I categorized that under Food & Drinks.
          </div>
        </div>

        <div className="flex justify-start">
          <div className="bg-gray-100 text-sm px-4 py-2 rounded-2xl rounded-bl-sm max-w-[75%]">
            Got it! ☕ I categorized that under Food & Drinks.
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-gray-100 text-sm px-4 py-2 rounded-2xl rounded-bl-sm max-w-[75%]">
            Got it! ☕ I categorized that under Food & Drinks.
          </div>
        </div>
      </div>

      {/* Chat Input Area */}
      <div className="border-t pt-2 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-full hover:bg-emerald-700 transition">
          Send
        </button>
      </div>

      {/* View Budget Link */}
      <a
        href="/bw-ai"
        className="text-xs mt-auto pt-4 font-medium text-emerald-600 hover:text-emerald-700 transition"
      >
        Visit AI
      </a>
    </div>
  );
};

export default AIWidget;
