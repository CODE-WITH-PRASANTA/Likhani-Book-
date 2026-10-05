import React, { useState } from 'react'
import { FaPlay, FaTimes } from 'react-icons/fa'
import './Thebookel.css'
import aboutImage from '../../assets/about.webp' // अपनी इमेज का पाथ यहाँ सेट करें

const Thebookel = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <>
      <section className="thebookel-section">
        <div className="thebookel-container">
          {/* Left: Image & Video Trigger */}
          <div className="thebookel-media-col">
            <div className="thebookel-image-card">
              <img
                src={aboutImage}
                alt="Woman reading book on couch"
                className="thebookel-image"
              />
              <button
                type="button"
                className="thebookel-play-btn"
                aria-label="Play video"
                onClick={() => setIsVideoOpen(true)}
              >
                <span className="thebookel-play-pulse" />
                <span className="thebookel-play-circle">
                  <FaPlay className="thebookel-play-icon" />
                </span>
              </button>
            </div>
          </div>

          {/* Right: Content */}
          <div className="thebookel-text-col">
            <h2 className="thebookel-title">
              About The Bookle <br /> Books Store
            </h2>
            <p className="thebookel-description">
              Nullam convallis ullamcorper nulla. Nam accumsan ac leo quis posuere. Nunc rutrum lorem justo, at blandit mauris ullamcorper tristique. Suspendisse vel ante venenatis, porttitor ligula sed, iaculis metus. Nullam non erat gravida, viverra leo ut, maximus tortor. Pellentesque vitae nunc rhoncus, lacinia nulla sed, commodo lectus. Curabitur at consectetur velit.
            </p>
            <p className="thebookel-description">
              Morbi cursus enim in consequat suscipit. Quisque id dui ante. Praesent auctor sed velit ac aliquet. Morbi consectetur sem nec ipsum malesuada, ut gravida nisl molestie. Proin hendrerit ullamcorper dui, quis convallis mauris cursus nec. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vivamus ac laoreet orci.
            </p>
            <div className="thebookel-link-wrap">
              <a href="#overview" className="thebookel-overview-link">
                Overview <span className="thebookel-arrow">↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoOpen && (
        <div
          className="thebookel-modal-backdrop"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="thebookel-modal-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="thebookel-modal-close"
              aria-label="Close video"
              onClick={() => setIsVideoOpen(false)}
            >
              <FaTimes />
            </button>
            <div className="thebookel-video-embed">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Bookle Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Thebookel