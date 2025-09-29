export default function Hero() {
  return (
    <section 
      className="relative text-white overflow-hidden mb-8"
      data-testid="hero-section"
    >
      <div 
        className="relative px-6 md:px-10 py-12 md:py-16 max-w-5xl mx-auto text-center rounded-xl"
        style={{
          background: `linear-gradient(135deg, #166534 0%, #15803d 30%, #14532d 70%, #166534 100%)`,
          boxShadow: '0 4px 20px rgba(22, 101, 52, 0.3)'
        }}
      >
        {/* Subtle texture */}
        <div 
          className="absolute inset-0 opacity-10 rounded-xl"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.2) 1px, transparent 0)',
            backgroundSize: '25px 25px'
          }}
        />
        
        <div className="relative space-y-6">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            data-testid="hero-title"
          >
            <span className="text-white">
              AckDeer Project
            </span>
          </h1>
          
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-white/60"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="h-px w-12 bg-white/60"></div>
          </div>
          
          <p 
            className="text-lg md:text-xl text-green-100 italic max-w-2xl mx-auto"
            data-testid="hero-tagline"
          >
            2,000 deer = 75,000 meals for Nantucket families
          </p>
        </div>
      </div>
    </section>
  );
}