import React from "react";

interface GoalsWidgetProps {
  width: string | number;
}

const GoalsWidget = ({ width }: GoalsWidgetProps): React.ReactElement => {
  const goals = [
    {
      id: "goal_1",
      title: "Emergency Fund",
      progressPercent: 45,
    },
    {
      id: "goal_3",
      title: "Pay Off Credit Card",
      progressPercent: 82,
    },
    {
      id: "goal_4",
      title: "New Laptop",
      progressPercent: 30,
    },
    {
      id: "goal_5",
      title: "Car Down Payment",
      progressPercent: 55,
    },
  ];
  return (
    <div
      style={{ width }}
      className="goals-widget relative flex flex-col shadow-lg p-4 rounded-md bg-white"
    >
      {/* Widget Title */}
      <h2 className="widget-title mt-auto relative text-lg font-serifDisplay mb-3">
        Goals
        <span className="absolute left-0 -bottom-0 w-16 h-[0.15px] bg-black"></span>
      </h2>
      <div className="overflow-y-auto scrollbar-hide flex-1 pr-2">
        <div className="goals-list flex flex-col space-y-3">
          {goals.map((goal) => {
            return (
              <div className="goal-item flex flex-col gap-1 leading-tight">
                <p className="font-normal text-sm">{goal.title}</p>
                {/* Progress Bar */}
                <div className="progress-bar h-[10px] rounded-md w-full bg-gray-100">
                  <div
                    style={{ width: goal.progressPercent }}
                    className="pl-1 h-full bg-emerald-400 rounded-md"
                  ></div>
                </div>
                <p className="text-xs m-0 p-0 text-right text-gray-600">
                  {goal.progressPercent}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <a
        href="/goals"
        className="text-xs mt-auto pt-4 font-medium text-emerald-600 hover:text-emerald-700 transition"
      >
        View all
      </a>
    </div>
  );
};

export default GoalsWidget;
