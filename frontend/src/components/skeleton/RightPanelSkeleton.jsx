const RightPanelSkeleton = () => {
  return (
    // FIX: Changed "animate-plulse" to "animate-pulse"
    <div className="flex flex-col gap-2 w-60 my-2 animate-pulse">
      <div className="flex items-center justify-between gap-2 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="skeleton w-10 h-10 rounded-full bg-base-300"></div>
          <div className="flex flex-col gap-1">
            <div className="skeleton h-3 w-20 rounded-full bg-base-300"></div>
            <div className="skeleton h-3 w-28 rounded-full bg-base-300"></div>
          </div>
        </div>
        <div className="skeleton h-8 w-16 rounded-full bg-base-300"></div>
      </div>
    </div>
  );
};

export default RightPanelSkeleton;
