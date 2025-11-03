const DotFlashing = () => {
  return (
    <div className="flex items-center justify-center p-2">
      <div className="bg-primary relative h-2 w-2 rounded-full">
        <style jsx>{`
          div.relative {
            animation: dotFlashing 1s infinite linear alternate;
            animation-delay: 0.5s;
          }

          div.relative::before,
          div.relative::after {
            display: inline-block;
            position: absolute;
            top: 0;
            animation: dotFlashing 1s infinite alternate;
            border-radius: 4px;
            background-color: hsl(var(--primary));
            width: 8px;
            height: 8px;
            content: "";
          }

          div.relative::before {
            left: -12px;
            animation-delay: 0s;
          }

          div.relative::after {
            left: 12px;
            animation-delay: 1s;
          }

          @keyframes dotFlashing {
            0% {
              background-color: hsl(var(--primary));
            }
            50%,
            100% {
              background-color: hsl(var(--primary) / 0.5);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default DotFlashing;
