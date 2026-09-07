import "./LandingPage.css";

function LandingPage({ onStart }) {
  return (
    <div className="landing-page">

      {/* Background Decorations */}

      <div className="landing-orb orb-one"></div>

      <div className="landing-orb orb-two"></div>

      <div className="landing-orb orb-three"></div>

      <div className="landing-spark spark-one">
        ✦
      </div>

      <div className="landing-spark spark-two">
        ✧
      </div>

      <div className="landing-spark spark-three">
        ✦
      </div>

      <div className="landing-spark spark-four">
        ✧
      </div>


      {/* Main Content */}

      <div className="landing-content">

        {/* Welcome */}

        <div className="landing-badge">
          ✨ Welcome to
        </div>


        {/* Website Name */}
<h1 className="landing-title">
  Prep<span>Nexa</span>
</h1>


        {/* Subtitle */}

        <p className="landing-subtitle">
          Your Placement Preparation Hub
        </p>


        {/* Divider */}

        <div className="landing-divider">

          <span></span>

          <div>✦</div>

          <span></span>

        </div>


        {/* Quote */}

        <h2 className="landing-quote">

          Practice More.

          <br />

          Aim Higher.

          <br />

          <span>
            Win Bigger!
          </span>

        </h2>


        {/* Description */}

        <p className="landing-description">

          Prepare smarter. Practice consistently.

          <br />

          Turn your skills into success.

        </p>


        {/* Get Started */}

        <button
          className="landing-start-btn"
          onClick={onStart}
        >
          <span>
            Get Started
          </span>

          <span className="start-arrow">
            🚀
          </span>
        </button>


        <div className="landing-hint">
          Click to begin your journey
        </div>

      </div>


      {/* Footer */}

      <div className="landing-footer">

        🚀 Learn

        <span>•</span>

        Practice

        <span>•</span>

        Grow

        <span>•</span>

        Succeed

      </div>

    </div>
  );
}

export default LandingPage;