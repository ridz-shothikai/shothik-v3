const WaitingpageContainer = ({ children, title }) => {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col items-center gap-2">
        {/* Logo */}
        <img
          src="/moscot.png"
          alt="Logo"
          height={80}
          className="mb-2"
        />

        {/* Subtitle */}
        <p className="text-sm uppercase tracking-widest mb-1 text-muted-foreground">
          Shothik AI
        </p>

        {/* Main Heading */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-medium text-foreground">
            Join the waitlist for the <br />
            <span
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            >
              {title}
            </span>
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
};

export default WaitingpageContainer;
